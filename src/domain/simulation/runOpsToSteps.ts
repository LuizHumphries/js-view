import type { SimulationStep, SimulationTask, SimulationTaskKind } from './types'
import type { SimulationOp } from './ops'
import type { BlockType } from '../blocks/types'

type RuntimeState = {
    callStack: SimulationTask[]
    microTasks: SimulationTask[]
    macroTasks: SimulationTask[]
    webApis: SimulationTask[]
    consoleOutput: string[]
    waitingBlockIds: Set<string>
}

function createInitialRuntime(): RuntimeState {
    return {
        callStack: [],
        microTasks: [],
        macroTasks: [],
        webApis: [],
        consoleOutput: [],
        waitingBlockIds: new Set(),
    }
}

const STEP_TIME_MS = 500

export function runOpsToSteps(ops: SimulationOp[]): SimulationStep[] {
    const runtime = createInitialRuntime()
    const steps: SimulationStep[] = []
    let previousOp: SimulationOp | null = null

    let nextTaskId = 1
    function createTask(
        label: string,
        source: BlockType,
        blockInstanceId: string,
        kind: SimulationTaskKind,
        delayMs?: number,
    ): SimulationTask {
        return {
            id: `task-${nextTaskId++}`,
            label,
            source,
            blockInstanceId,
            kind,
            delayMs,
            remainingMs: delayMs,
        }
    }

    function snapshotState(
        description: string,
        opts: {
            activeBlockInstanceId?: string | null
            transitingTask?: SimulationTask | null
            jsEngineTask?: SimulationTask | null
        } = {},
    ): SimulationStep {
        return {
            id: `step-${steps.length}`,
            callStack: [...runtime.callStack],
            microTaskQueue: [...runtime.microTasks],
            macroTaskQueue: [...runtime.macroTasks],
            webApis: runtime.webApis.map((t) => ({ ...t })),
            consoleOutput: [...runtime.consoleOutput],
            description,
            currentlyProcessing: opts.transitingTask ?? null,
            jsEngineTask: opts.jsEngineTask ?? null,
            sourceOpIndex: -1,
            activeBlockInstanceId: opts.activeBlockInstanceId ?? null,
            waitingBlockInstanceIds: [...runtime.waitingBlockIds],
        }
    }

    function tickTimers(): SimulationTask[] {
        const expired: SimulationTask[] = []
        for (const task of runtime.webApis) {
            if (task.remainingMs !== undefined) {
                task.remainingMs = Math.max(0, task.remainingMs - STEP_TIME_MS)
                if (task.remainingMs === 0) {
                    expired.push(task)
                }
            }
        }
        for (const task of expired) {
            const idx = runtime.webApis.indexOf(task)
            if (idx !== -1) {
                runtime.webApis.splice(idx, 1)
            }
        }
        return expired
    }

    steps.push(snapshotState('Estado inicial do script.'))

    for (const op of ops) {
        switch (op.kind) {
            case 'syncLog': {
                const task = createTask(op.message, op.source, op.blockInstanceId, 'sync')

                steps.push(
                    snapshotState(`"${op.message}" entra no Motor JS.`, {
                        activeBlockInstanceId: op.blockInstanceId,
                        jsEngineTask: task,
                    }),
                )

                runtime.callStack.push(task)
                steps.push(
                    snapshotState(`"${op.message}" entra na pilha de chamadas.`, {
                        activeBlockInstanceId: op.blockInstanceId,
                    }),
                )

                runtime.consoleOutput.push(op.message)
                steps.push(
                    snapshotState(`Executando: console.log("${op.message}")`, {
                        activeBlockInstanceId: op.blockInstanceId,
                    }),
                )

                runtime.callStack.pop()
                steps.push(
                    snapshotState('Pilha de chamadas esvaziada.', {
                        activeBlockInstanceId: op.blockInstanceId,
                    }),
                )

                const expired = tickTimers()
                for (const t of expired) {
                    runtime.macroTasks.push(t)
                    steps.push(
                        snapshotState(
                            `Timer expirou! "${t.label}" entra na fila de macrotasks. (${t.delayMs}ms)`,
                            { activeBlockInstanceId: t.blockInstanceId },
                        ),
                    )
                }
                break
            }

            case 'promiseResolve': {
                const task = createTask(
                    'Promise.resolve()',
                    op.source,
                    op.blockInstanceId,
                    'promiseResolve',
                )

                steps.push(
                    snapshotState('Promise.resolve() entra no Motor JS.', {
                        activeBlockInstanceId: op.blockInstanceId,
                        jsEngineTask: task,
                    }),
                )

                runtime.callStack.push(task)
                steps.push(
                    snapshotState('Promise.resolve() entra na pilha de chamadas.', {
                        activeBlockInstanceId: op.blockInstanceId,
                    }),
                )

                runtime.callStack.pop()
                runtime.waitingBlockIds.add(op.blockInstanceId)
                steps.push(
                    snapshotState(
                        'Promise.resolve() executado. Agendando callback do .then() na fila de microtasks...',
                        {
                            activeBlockInstanceId: op.blockInstanceId,
                        },
                    ),
                )

                const expired = tickTimers()
                for (const t of expired) {
                    runtime.macroTasks.push(t)
                    steps.push(
                        snapshotState(
                            `Timer expirou! "${t.label}" entra na fila de macrotasks. (${t.delayMs}ms)`,
                            { activeBlockInstanceId: t.blockInstanceId },
                        ),
                    )
                }
                break
            }

            case 'scheduleMicrotask': {
                const task = createTask(op.message, op.source, op.blockInstanceId, 'microCallback')

                const shouldSkipEngineForPromiseThen =
                    op.source === 'promiseThen' &&
                    previousOp?.kind === 'promiseResolve' &&
                    previousOp.blockInstanceId === op.blockInstanceId

                const lastStep = steps[steps.length - 1]
                const isContinuationByDescription =
                    lastStep &&
                    (lastStep.description.includes('Preparando callback do .then()') ||
                        lastStep.description.includes('Pilha de chamadas esvaziada') ||
                        lastStep.description.includes('Agendando callback do .then()'))

                const shouldShowEngine =
                    !shouldSkipEngineForPromiseThen && !isContinuationByDescription

                if (shouldShowEngine) {
                    steps.push(
                        snapshotState(`"${op.message}" entra no Motor JS.`, {
                            activeBlockInstanceId: op.blockInstanceId,
                            jsEngineTask: task,
                        }),
                    )

                    runtime.callStack.push(task)
                    steps.push(
                        snapshotState(`"${op.message}" entra na pilha de chamadas.`, {
                            activeBlockInstanceId: op.blockInstanceId,
                        }),
                    )

                    runtime.callStack.pop()
                }

                runtime.microTasks.push(task)
                runtime.waitingBlockIds.add(op.blockInstanceId)

                const isPromise = op.source === 'promiseThen'
                const isAwait = op.source === 'asyncAwait'
                const desc = isPromise
                    ? `Callback do .then("${op.message}") entra na fila de microtasks.`
                    : isAwait
                      ? `Continuação após await ("${op.message}") entra na fila de microtasks.`
                      : `"${op.message}" entra na fila de microtasks.`

                steps.push(
                    snapshotState(desc, {
                        activeBlockInstanceId: op.blockInstanceId,
                    }),
                )

                const expired = tickTimers()
                for (const t of expired) {
                    runtime.macroTasks.push(t)
                    steps.push(
                        snapshotState(
                            `Timer expirou! "${t.label}" entra na fila de macrotasks. (${t.delayMs}ms)`,
                            { activeBlockInstanceId: t.blockInstanceId },
                        ),
                    )
                }
                break
            }

            case 'scheduleMacrotask': {
                const task = createTask(
                    op.message,
                    op.source,
                    op.blockInstanceId,
                    'macroCallback',
                    op.delayMs,
                )

                steps.push(
                    snapshotState(
                        `setTimeout("${op.message}", ${op.delayMs}ms) entra no Motor JS.`,
                        {
                            activeBlockInstanceId: op.blockInstanceId,
                            jsEngineTask: task,
                        },
                    ),
                )

                runtime.callStack.push(task)
                steps.push(
                    snapshotState(`setTimeout() entra na pilha de chamadas.`, {
                        activeBlockInstanceId: op.blockInstanceId,
                    }),
                )

                runtime.callStack.pop()
                runtime.webApis.push(task)
                runtime.waitingBlockIds.add(op.blockInstanceId)
                steps.push(
                    snapshotState(
                        `Timer "${op.message}" registrado nas Web APIs. Aguardando ${op.delayMs}ms...`,
                        { activeBlockInstanceId: op.blockInstanceId },
                    ),
                )

                const expired = tickTimers()
                for (const t of expired) {
                    runtime.macroTasks.push(t)
                    steps.push(
                        snapshotState(
                            `Timer expirou! "${t.label}" entra na fila de macrotasks. (${t.delayMs}ms)`,
                            { activeBlockInstanceId: t.blockInstanceId },
                        ),
                    )
                }
                break
            }
        }
        previousOp = op
    }

    steps.push(snapshotState('Fim do código síncrono. Event Loop inicia.'))

    while (
        runtime.microTasks.length > 0 ||
        runtime.macroTasks.length > 0 ||
        runtime.webApis.length > 0
    ) {
        if (runtime.microTasks.length > 0) {
            const task = runtime.microTasks.shift()!

            steps.push(
                snapshotState(`"${task.label}" sai da fila de microtasks.`, {
                    transitingTask: task,
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            runtime.callStack.push(task)
            steps.push(
                snapshotState(`"${task.label}" entra na pilha de chamadas.`, {
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            runtime.consoleOutput.push(task.label)
            steps.push(
                snapshotState(`Executando: console.log("${task.label}")`, {
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            runtime.callStack.pop()
            runtime.waitingBlockIds.delete(task.blockInstanceId)
            steps.push(
                snapshotState('Microtask concluída. Pilha de chamadas esvaziada.', {
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            const expired = tickTimers()
            for (const t of expired) {
                runtime.macroTasks.push(t)
                steps.push(
                    snapshotState(
                        `Timer expirou! "${t.label}" entra na fila de macrotasks. (${t.delayMs}ms)`,
                        { activeBlockInstanceId: t.blockInstanceId },
                    ),
                )
            }
            continue
        }

        if (runtime.webApis.length > 0 && runtime.macroTasks.length === 0) {
            const task = runtime.webApis[0]

            while (task.remainingMs && task.remainingMs > 0) {
                task.remainingMs = Math.max(0, task.remainingMs - STEP_TIME_MS)
                const remaining = task.remainingMs
                steps.push(
                    snapshotState(
                        `Web APIs: Timer "${task.label}" aguardando... ${remaining}ms restantes.`,
                        { activeBlockInstanceId: task.blockInstanceId },
                    ),
                )
            }

            runtime.webApis.shift()
            steps.push(
                snapshotState(`Timer expirou! "${task.label}" sai das Web APIs.`, {
                    transitingTask: task,
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            runtime.macroTasks.push(task)
            steps.push(
                snapshotState(`"${task.label}" entra na fila de macrotasks.`, {
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )
            continue
        }

        if (runtime.macroTasks.length > 0) {
            const task = runtime.macroTasks.shift()!

            steps.push(
                snapshotState(`"${task.label}" sai da fila de macrotasks.`, {
                    transitingTask: task,
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            runtime.callStack.push(task)
            steps.push(
                snapshotState(`"${task.label}" entra na pilha de chamadas.`, {
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            runtime.consoleOutput.push(task.label)
            steps.push(
                snapshotState(`Executando: console.log("${task.label}")`, {
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            runtime.callStack.pop()
            runtime.waitingBlockIds.delete(task.blockInstanceId)
            steps.push(
                snapshotState('Macrotask concluída. Pilha de chamadas esvaziada.', {
                    activeBlockInstanceId: task.blockInstanceId,
                }),
            )

            const expired = tickTimers()
            for (const t of expired) {
                runtime.macroTasks.push(t)
                steps.push(
                    snapshotState(
                        `Timer expirou! "${t.label}" entra na fila de macrotasks. (${t.delayMs}ms)`,
                        { activeBlockInstanceId: t.blockInstanceId },
                    ),
                )
            }
            continue
        }
    }

    steps.push(snapshotState('Simulação completa. Todas as filas estão vazias.'))
    return steps
}
