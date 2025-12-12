import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectSimulationState, selectBlocksWithTimelineState } from './selector'

import Zone from './Zone'
import TaskCard from './TaskCard'
import SimulationControls from './SimulationControls'
import EventLoopZone from './EventLoopZone'
import JsEngineProcessor from './JsEngineProcessor'
import CodeTimeline from './CodeTimeline'
import ConsoleOutput from './ConsoleOutput'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { goToStep, nextStep, pause, play, resetSimulation } from './simulationSlice'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { selectProgramBlocks } from '../program/programSlice'
import { createPortal } from 'react-dom'
import type { SimulationTask } from '../../domain/simulation/types'
import { cn } from '../../utils/cn'
import { getTaskBorderClasses } from './simulationVisuals'
import { LucideX } from 'lucide-react'

export default function SimulationVisualizer() {
    const dispatch = useAppDispatch()
    const simulation = useAppSelector(selectSimulationState)
    const { steps, currentStepIndex, status } = simulation
    const currentStep = steps[currentStepIndex] ?? steps.at(-1)
    const previousStep = steps[currentStepIndex - 1]

    const previousLineCount = useMemo(() => {
        return previousStep?.consoleOutput.length ?? 0
    }, [previousStep])

    const blocksWithState = useAppSelector(selectBlocksWithTimelineState)
    const programBlocks = useAppSelector(selectProgramBlocks)

    // Task que está transitando pelo Event Loop (saiu da fila, ainda não entrou na Call Stack)
    const eventLoopTransitTask = currentStep?.currentlyProcessing ?? null

    // Task que está no JS Engine (antes de ir para Call Stack ou filas)
    const jsEngineTask = currentStep?.jsEngineTask ?? null

    const transferAnimMs = simulation.ui.transferAnimMs

    // Quando uma task "entra no Motor JS", queremos animar ela saindo do Timeline
    // e chegando no Motor, acima de todos os blocos.
    const lastEngineTaskIdRef = useRef<string | null>(null)
    const prevStepIndexRef = useRef<number>(currentStepIndex)
    const navDeltaRef = useRef<number>(0)
    const [engineHoldTaskId, setEngineHoldTaskId] = useState<string | null>(null)
    const [isStepsHistoryOpen, setIsStepsHistoryOpen] = useState(false)
    const [transferTask, setTransferTask] = useState<{
        task: SimulationTask
        from: { left: number; top: number; width: number; height: number }
        to: { left: number; top: number; width: number; height: number }
    } | null>(null)

    // Regra de UX: não mostrar "futuro" no histórico.
    // O usuário só pode ver/navegar até o step atual.
    const visibleSteps = useMemo(() => {
        if (steps.length === 0) return []
        const max = Math.min(currentStepIndex + 1, steps.length)
        return steps.slice(0, max)
    }, [steps, currentStepIndex])

    type DomTaskInfo = {
        rect: { left: number; top: number; width: number; height: number }
        zone: string
    }
    const prevDomTasksRef = useRef<Map<string, DomTaskInfo>>(new Map())
    const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set())
    const [zoneFlights, setZoneFlights] = useState<
        Array<{
            task: SimulationTask
            from: DomTaskInfo['rect']
            to: DomTaskInfo['rect']
        }>
    >([])
    const lastFlightStepRef = useRef<number | null>(null)

    // Detecta direção/avanço do step.
    // Importante: isso precisa acontecer ANTES do cálculo das posições (useLayoutEffect abaixo),
    // senão o delta ainda é 0 e a animação não dispara.
    useLayoutEffect(() => {
        navDeltaRef.current = currentStepIndex - prevStepIndexRef.current
        prevStepIndexRef.current = currentStepIndex

        // Animamos quando avançamos exatamente +1 step.
        // (Assim: não anima "pulos" via timeline, nem voltar, nem reset.)
        const shouldAnimate = steps.length > 0 && navDeltaRef.current === 1 && status !== 'idle'
        if (!shouldAnimate) {
            // Ao voltar, resetar ou "pular" steps, limpamos overlays/holds para não ficar nada fantasma.
            setTransferTask(null)
            setEngineHoldTaskId(null)
            setZoneFlights([])
            setHiddenTaskIds(new Set())
            prevDomTasksRef.current = new Map()
            lastFlightStepRef.current = null
        }
    }, [currentStepIndex, status, steps.length])

    // Quando a simulação muda (regerar/reset), também limpa qualquer estado local de animação.
    useEffect(() => {
        setTransferTask(null)
        setEngineHoldTaskId(null)
        setZoneFlights([])
        setHiddenTaskIds(new Set())
        prevDomTasksRef.current = new Map()
        lastFlightStepRef.current = null
        lastEngineTaskIdRef.current = null
    }, [simulation.builtHash, steps.length])

    useEffect(() => {
        if (programBlocks.length !== 0) return
        if (simulation.steps.length === 0 && simulation.status === 'idle') return
        dispatch(resetSimulation())
    }, [programBlocks.length, simulation.steps.length, simulation.status, dispatch])

    useEffect(() => {
        if (status !== 'running') return
        if (steps.length === 0) return

        const isLastStep = currentStepIndex >= steps.length - 1

        const timeoutId = setTimeout(() => {
            if (!isLastStep) {
                dispatch(nextStep())
            } else if (simulation.playback.autoplay) {
                dispatch(goToStep(0))
                dispatch(play())
            } else {
                dispatch(pause())
            }
        }, transferAnimMs + 50)

        return () => clearTimeout(timeoutId)
    }, [
        status,
        steps.length,
        currentStepIndex,
        simulation.playback.autoplay,
        transferAnimMs,
        dispatch,
    ])

    useEffect(() => {
        const nextTaskId = jsEngineTask?.id ?? null
        const prevTaskId = lastEngineTaskIdRef.current
        // sempre atualiza, mesmo quando não animamos, pra evitar re-disparos estranhos
        lastEngineTaskIdRef.current = nextTaskId

        const shouldAnimate = steps.length > 0 && navDeltaRef.current === 1 && status !== 'idle'

        // Só dispara quando uma NOVA task aparece no Motor JS
        if (!nextTaskId) return
        if (prevTaskId === nextTaskId) return
        if (!jsEngineTask) return
        if (!shouldAnimate) return

        const fromEl = document.querySelector(
            '[data-sim-timeline-active="true"]',
        ) as HTMLElement | null
        const toEl =
            (document.querySelector(
                `[data-sim-task-id="${nextTaskId}"][data-sim-zone="engine"]`,
            ) as HTMLElement | null) ??
            (document.querySelector('[data-sim-js-engine="true"]') as HTMLElement | null)
        if (!fromEl || !toEl) return

        const from = fromEl.getBoundingClientRect()
        const to = toEl.getBoundingClientRect()

        // Segura a renderização da task no Motor até a animação terminar
        setEngineHoldTaskId(nextTaskId)
        setTransferTask({
            task: jsEngineTask,
            from: { left: from.left, top: from.top, width: from.width, height: from.height },
            to: { left: to.left, top: to.top, width: to.width, height: to.height },
        })
    }, [jsEngineTask, status, currentStepIndex])

    // Captura posições reais no DOM e cria "voos" entre zonas sem clipping.
    useLayoutEffect(() => {
        if (!currentStep) return
        const shouldAnimate = steps.length > 0 && navDeltaRef.current === 1 && status !== 'idle'
        if (!shouldAnimate) {
            // Sem animação quando voltamos/pulamos: só atualiza cache de posições.
            const nextMap = new Map<string, DomTaskInfo>()
            const nodes = document.querySelectorAll('[data-sim-task-id]')
            nodes.forEach((node) => {
                const el = node as HTMLElement
                const id = el.getAttribute('data-sim-task-id')
                if (!id) return
                const zone = el.getAttribute('data-sim-zone') ?? ''
                const r = el.getBoundingClientRect()
                nextMap.set(id, {
                    zone,
                    rect: { left: r.left, top: r.top, width: r.width, height: r.height },
                })
            })
            prevDomTasksRef.current = nextMap
            return
        }

        // Evita recriar os mesmos voos em re-renders do mesmo step.
        if (lastFlightStepRef.current === currentStepIndex) {
            // Atualiza o cache de posições mesmo assim.
            const nextMap = new Map<string, DomTaskInfo>()
            const nodes = document.querySelectorAll('[data-sim-task-id]')
            nodes.forEach((node) => {
                const el = node as HTMLElement
                const id = el.getAttribute('data-sim-task-id')
                if (!id) return
                const zone = el.getAttribute('data-sim-zone') ?? ''
                const r = el.getBoundingClientRect()
                nextMap.set(id, {
                    zone,
                    rect: { left: r.left, top: r.top, width: r.width, height: r.height },
                })
            })
            prevDomTasksRef.current = nextMap
            return
        }

        const nextMap = new Map<string, DomTaskInfo>()
        const nodes = document.querySelectorAll('[data-sim-task-id]')
        nodes.forEach((node) => {
            const el = node as HTMLElement
            const id = el.getAttribute('data-sim-task-id')
            if (!id) return
            const zone = el.getAttribute('data-sim-zone') ?? ''
            const r = el.getBoundingClientRect()
            nextMap.set(id, {
                zone,
                rect: { left: r.left, top: r.top, width: r.width, height: r.height },
            })
        })

        const prevMap = prevDomTasksRef.current
        prevDomTasksRef.current = nextMap
        lastFlightStepRef.current = currentStepIndex

        if (!prevMap || prevMap.size === 0) return

        const prevStep = steps[currentStepIndex - 1]
        if (!prevStep) return

        const allPrevTasks = [
            ...prevStep.callStack,
            ...prevStep.microTaskQueue,
            ...prevStep.macroTaskQueue,
            ...prevStep.webApis,
            ...(prevStep.currentlyProcessing ? [prevStep.currentlyProcessing] : []),
            ...(prevStep.jsEngineTask ? [prevStep.jsEngineTask] : []),
        ]
        const allCurrTasks = [
            ...currentStep.callStack,
            ...currentStep.microTaskQueue,
            ...currentStep.macroTaskQueue,
            ...currentStep.webApis,
            ...(currentStep.currentlyProcessing ? [currentStep.currentlyProcessing] : []),
            ...(currentStep.jsEngineTask ? [currentStep.jsEngineTask] : []),
        ]

        const byId = new Map<string, SimulationTask>()
        for (const t of [...allPrevTasks, ...allCurrTasks]) byId.set(t.id, t)

        const flights: Array<{
            task: SimulationTask
            from: DomTaskInfo['rect']
            to: DomTaskInfo['rect']
        }> = []
        const hide = new Set<string>()

        for (const [id, nextInfo] of nextMap.entries()) {
            const prevInfo = prevMap.get(id)
            if (!prevInfo) continue
            if (!prevInfo.zone || !nextInfo.zone) continue
            if (prevInfo.zone === nextInfo.zone) continue

            const task = byId.get(id)
            if (!task) continue

            flights.push({ task, from: prevInfo.rect, to: nextInfo.rect })
            hide.add(id)
        }

        if (flights.length === 0) return

        setZoneFlights(flights)
        setHiddenTaskIds((prev) => {
            const merged = new Set(prev)
            hide.forEach((id) => merged.add(id))
            return merged
        })

        const timeoutId = window.setTimeout(() => {
            setZoneFlights([])
            setHiddenTaskIds((prev) => {
                const next = new Set(prev)
                hide.forEach((id) => next.delete(id))
                return next
            })
        }, transferAnimMs)

        return () => window.clearTimeout(timeoutId)
    }, [currentStepIndex, currentStep, steps, transferAnimMs, status])

    return (
        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-bg-block">
            <header className="relative z-20 flex flex-row items-center justify-between gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1">
                <div className="flex flex-row gap-4">
                    <h2 className="font-bold tracking-wide text-text-primary uppercase">
                        Visualizador do Event Loop
                    </h2>
                </div>
                <SimulationControls simulation={simulation} />
            </header>

            <div className="px-4 pt-2 sm:pt-3">
                <div className="rounded-xl border border-border-subtle bg-bg-panel/60 px-4 py-3 shadow-md sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-slate-200/85">
                            <span className="mr-2 font-mono text-[12px] text-slate-400">
                                {steps.length ? `${currentStepIndex + 1}/${steps.length}` : '—'}
                            </span>
                            <span className="mr-2 text-slate-500">-&gt;</span>
                            {programBlocks.length === 0
                                ? 'Selecione os blocos disponíveis e clique em Gerar para iniciar a simulação.'
                                : (currentStep?.description ??
                                  'Clique em Gerar para iniciar a simulação.')}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsStepsHistoryOpen(true)}
                            className={cn(
                                'shrink-0 rounded-lg border border-border-subtle bg-bg-block-hover px-3 py-2 text-xs font-semibold tracking-wide text-text-primary',
                                'transition-colors hover:bg-bg-block-strong',
                            )}
                        >
                            Histórico
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex min-h-0 flex-1 gap-3 overflow-hidden p-4 sm:gap-4">
                <LayoutGroup>
                    <div className="hidden w-56 shrink-0 md:block">
                        <CodeTimeline
                            blocks={blocksWithState}
                            currentIndex={currentStepIndex}
                            isRunning={status === 'running'}
                        />
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden sm:gap-4">
                        <div className="shrink-0 md:hidden">
                            <div className="h-28 sm:h-32">
                                <CodeTimeline
                                    blocks={blocksWithState}
                                    currentIndex={currentStepIndex}
                                    isRunning={status === 'running'}
                                />
                            </div>
                        </div>

                        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden sm:gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                            <div className="min-w-0">
                                <EventLoopZone
                                    status={status}
                                    hasBuilt={steps.length > 0}
                                    transitTask={eventLoopTransitTask}
                                />
                            </div>

                            <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                                <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                                    <Zone title="Call Stack">
                                        <AnimatePresence initial={false}>
                                            {currentStep?.callStack.map((task) => {
                                                const nextStep = steps[currentStepIndex + 1]
                                                const isRemovedNext =
                                                    !!nextStep &&
                                                    !nextStep.callStack.some(
                                                        (t) => t.id === task.id,
                                                    )
                                                return (
                                                    <TaskCard
                                                        key={`card-${task.id}`}
                                                        task={task}
                                                        isWaiting={false}
                                                        zoneId="callstack"
                                                        isHidden={hiddenTaskIds.has(task.id)}
                                                        exitAnimation={
                                                            isRemovedNext ? 'final' : 'none'
                                                        }
                                                    />
                                                )
                                            })}
                                        </AnimatePresence>
                                    </Zone>
                                    <Zone title="Fila de microtasks" variant="microtask">
                                        {currentStep?.microTaskQueue.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                isWaiting={true}
                                                zoneId="microtask"
                                                isHidden={hiddenTaskIds.has(task.id)}
                                            />
                                        ))}
                                    </Zone>
                                    <Zone title="Web APIs" variant="webapi">
                                        {currentStep?.webApis.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                isWaiting={true}
                                                zoneId="webapi"
                                                isHidden={hiddenTaskIds.has(task.id)}
                                            />
                                        ))}
                                    </Zone>
                                    <Zone title="Fila de macrotasks" variant="macrotask">
                                        {currentStep?.macroTaskQueue.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                isWaiting={true}
                                                zoneId="macrotask"
                                                isHidden={hiddenTaskIds.has(task.id)}
                                            />
                                        ))}
                                    </Zone>
                                </div>

                                <div className="mt-2 shrink-0 sm:mt-3">
                                    <JsEngineProcessor
                                        currentTask={
                                            engineHoldTaskId &&
                                            jsEngineTask?.id === engineHoldTaskId
                                                ? null
                                                : jsEngineTask
                                        }
                                        isHoldingTask={
                                            engineHoldTaskId !== null &&
                                            jsEngineTask?.id === engineHoldTaskId
                                        }
                                        holdingTask={
                                            engineHoldTaskId !== null &&
                                            jsEngineTask?.id === engineHoldTaskId
                                                ? jsEngineTask
                                                : null
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <section className="flex h-32 shrink-0 flex-col rounded-xl border border-slate-800 bg-black/60 p-3 sm:h-36 md:h-40 lg:h-44">
                            <h3 className="mb-2 shrink-0 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                Console
                            </h3>
                            <ConsoleOutput
                                lines={currentStep?.consoleOutput ?? []}
                                previousLineCount={previousLineCount}
                                isSimulationComplete={currentStepIndex >= steps.length - 1}
                            />
                        </section>
                    </div>
                </LayoutGroup>
            </main>

            {/* Overlay global (Portal): anima a task do Timeline até o Motor JS */}
            {transferTask
                ? createPortal(
                      <motion.div
                          initial={{
                              left: transferTask.from.left,
                              top: transferTask.from.top,
                              width: transferTask.from.width,
                              height: transferTask.from.height,
                              opacity: 0.95,
                              scale: 1,
                          }}
                          animate={{
                              left: transferTask.to.left,
                              top: transferTask.to.top,
                              width: transferTask.to.width,
                              height: transferTask.to.height,
                              opacity: 1,
                              scale: 1.02,
                          }}
                          transition={{
                              duration: transferAnimMs / 1000,
                              ease: [0.22, 1, 0.36, 1],
                          }}
                          onAnimationComplete={() => {
                              // Libera o Motor para renderizar a task "depois" da animação
                              setTransferTask(null)
                              setEngineHoldTaskId(null)
                          }}
                          style={{
                              position: 'fixed',
                              zIndex: 9999,
                              pointerEvents: 'none',
                          }}
                          className={cn(
                              'rounded-xl border bg-bg-block-strong px-3 py-2 text-xs text-text-primary shadow-xl',
                              getTaskBorderClasses(transferTask.task.source),
                          )}
                      >
                          {transferTask.task.label}
                      </motion.div>,
                      document.body,
                  )
                : null}

            {/* Voos entre zonas (Callstack <-> Filas <-> Web APIs <-> EventLoop <-> Motor JS) */}
            {zoneFlights.length > 0
                ? createPortal(
                      <div
                          style={{
                              position: 'fixed',
                              left: 0,
                              top: 0,
                              width: '100vw',
                              height: '100vh',
                              pointerEvents: 'none',
                              zIndex: 9998,
                          }}
                      >
                          {zoneFlights.map((f) => (
                              <motion.div
                                  key={`flight-${f.task.id}-${currentStepIndex}`}
                                  initial={{
                                      left: f.from.left,
                                      top: f.from.top,
                                      width: f.from.width,
                                      height: f.from.height,
                                      opacity: 0.98,
                                  }}
                                  animate={{
                                      left: f.to.left,
                                      top: f.to.top,
                                      width: f.to.width,
                                      height: f.to.height,
                                      opacity: 1,
                                  }}
                                  transition={{
                                      duration: transferAnimMs / 1000,
                                      ease: [0.22, 1, 0.36, 1],
                                  }}
                                  style={{ position: 'fixed' }}
                                  className={cn(
                                      'rounded-xl border bg-bg-block-strong px-3 py-2 text-xs text-text-primary shadow-xl',
                                      getTaskBorderClasses(f.task.source),
                                  )}
                              >
                                  {f.task.label}
                              </motion.div>
                          ))}
                      </div>,
                      document.body,
                  )
                : null}

            {/* Modal lateral (esquerda): histórico de steps */}
            {createPortal(
                <AnimatePresence>
                    {isStepsHistoryOpen ? (
                        <motion.div
                            className="fixed inset-0 z-10000"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <button
                                type="button"
                                aria-label="Fechar histórico"
                                className="absolute inset-0 bg-black/55"
                                onClick={() => setIsStepsHistoryOpen(false)}
                            />
                            <motion.aside
                                className="absolute top-0 left-0 flex h-full w-[360px] max-w-[92vw] flex-col border-r border-border-subtle bg-bg-panel shadow-2xl"
                                initial={{ x: -24, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -24, opacity: 0 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                            >
                                <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                            Histórico de steps
                                        </span>
                                        <span className="text-xs text-text-muted">
                                            {steps.length
                                                ? `Step ${Math.min(currentStepIndex + 1, steps.length)}/${steps.length}`
                                                : 'Sem steps ainda'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsStepsHistoryOpen(false)}
                                        className="rounded-lg border border-border-subtle bg-bg-block-hover p-2 text-text-primary transition-colors hover:bg-bg-block-strong"
                                        aria-label="Fechar"
                                    >
                                        <LucideX className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="min-h-0 flex-1 overflow-auto p-2">
                                    {visibleSteps.length === 0 ? (
                                        <div className="p-3 text-sm text-text-muted">
                                            Gere a simulação para ver o histórico.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            {visibleSteps.map((s, idx) => {
                                                const isActive = idx === currentStepIndex
                                                return (
                                                    <button
                                                        key={`step-history-${idx}`}
                                                        type="button"
                                                        onClick={() => dispatch(goToStep(idx))}
                                                        className={cn(
                                                            'w-full rounded-lg border px-3 py-2 text-left text-xs',
                                                            'transition-colors',
                                                            isActive
                                                                ? 'border-accent-gold/40 bg-accent-gold/10 text-text-primary'
                                                                : 'border-border-subtle bg-bg-block/40 text-slate-200/85 hover:bg-bg-block-hover',
                                                        )}
                                                    >
                                                        <span className="font-mono text-[11px] text-slate-400">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="mx-2 text-slate-500">
                                                            -&gt;
                                                        </span>
                                                        <span className="text-xs">
                                                            {s.description ?? '—'}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.aside>
                        </motion.div>
                    ) : null}
                </AnimatePresence>,
                document.body,
            )}
        </section>
    )
}
