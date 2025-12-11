import { nanoid } from '@reduxjs/toolkit'
import type { BlockType } from '../blocks/types'
import type { SimulationStep } from './types'
import type { SimulationOp } from './ops'

type RuntimeState = {
    callStack: string[]
    microTasks: { message: string; source: BlockType }[]
    macroTasks: { message: string; source: BlockType }[]
    webApis: string[]
    consoleOutput: string[]
}

function createInitialRuntime(): RuntimeState {
    return {
        callStack: [],
        microTasks: [],
        macroTasks: [],
        webApis: [],
        consoleOutput: [],
    }
}

function snapshotState(runtime: RuntimeState, description: string): SimulationStep {
    return {
        id: nanoid(),
        callStack: [...runtime.callStack],
        microTaskQueue: runtime.microTasks.map((t) => t.message),
        macroTaskQueue: runtime.macroTasks.map((t) => t.message),
        webApis: [...runtime.webApis],
        consoleOutput: [...runtime.consoleOutput],
        description,
    }
}

export function runOpsToSteps(ops: SimulationOp[]): SimulationStep[] {
    const runtime = createInitialRuntime()
    const steps: SimulationStep[] = []

    steps.push(snapshotState(runtime, 'Estado inicial do script.'))

    for (const op of ops) {
        switch (op.kind) {
            case 'syncLog': {
                runtime.callStack = [`sync:${op.source}`]
                runtime.consoleOutput.push(op.message)
                steps.push(snapshotState(runtime, `Log sincrono de ${op.source}: "${op.message}".`))
                runtime.callStack = []
                break
            }
            case 'scheduleMicrotask': {
                runtime.microTasks.push({
                    message: op.message,
                    source: op.source,
                })
                steps.push(
                    snapshotState(
                        runtime,
                        `Agendamos uma microtask de ${op.source} para logar "${op.message}".`,
                    ),
                )
                break
            }
            case 'scheduleMacrotask': {
                runtime.macroTasks.push({
                    message: op.message,
                    source: op.source,
                })
                runtime.webApis.push(`Timer para "${op.message}" (${op.source})`)

                steps.push(
                    snapshotState(
                        runtime,
                        `Agendamos uma macrotask de ${op.source} na Web API para logar "${op.message}".`,
                    ),
                )
                break
            }
        }
    }

    while (runtime.microTasks.length > 0 || runtime.macroTasks.length > 0) {
        if (runtime.microTasks.length > 0) {
            const task = runtime.microTasks.shift()!

            runtime.callStack = [`microtask:${task.source}`]
            runtime.consoleOutput.push(task.message)

            steps.push(
                snapshotState(
                    runtime,
                    `Executamos uma microtask de ${task.source} e logamos "${task.message}".`,
                ),
            )
            runtime.callStack = []
            continue
        }

        if (runtime.macroTasks.length > 0) {
            const task = runtime.macroTasks.shift()!

            runtime.callStack = [`macroTasks:${task.source}`]
            runtime.consoleOutput.push(task.message)

            const idx = runtime.webApis.findIndex((apiLabel) => apiLabel.includes(task.message))
            if (idx >= 0) {
                runtime.webApis.splice(idx, 1)
            }

            steps.push(
                snapshotState(
                    runtime,
                    `Executamos uma macrotask de ${task.source} e logamos "${task.message}".`,
                ),
            )
            runtime.callStack = []
        }
    }
    return steps
}
