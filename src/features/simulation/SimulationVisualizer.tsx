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

    const eventLoopTransitTask = currentStep?.currentlyProcessing ?? null

    const jsEngineTask = currentStep?.jsEngineTask ?? null

    const transferAnimSpeed = simulation.ui.transferAnimSpeed
    const transferAnimDurationS = useMemo(() => {
        const MIN_S = 0.15
        const MAX_S = 2.0
        const t = Math.min(Math.max(transferAnimSpeed, 0), 100) / 100
        return MAX_S + (MIN_S - MAX_S) * t
    }, [transferAnimSpeed])

    const transitionStepRef = useRef<number | null>(null)
    const shouldAutoAdvanceRef = useRef(false)
    const animationsInFlightRef = useRef(0)
    const transitionCycleClosedRef = useRef(false)
    const flightHiddenIdsRef = useRef<Set<string>>(new Set())
    const zoneFlightRemainingRef = useRef(0)

    const lastEngineTaskIdRef = useRef<string | null>(null)
    const prevStepIndexRef = useRef<number>(currentStepIndex)
    const navDeltaRef = useRef<number>(0)
    const [engineHoldTaskId, setEngineHoldTaskId] = useState<string | null>(null)
    const [isStepsHistoryOpen, setIsStepsHistoryOpen] = useState(false)
    const [isMdUp, setIsMdUp] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true
        if (!('matchMedia' in window)) return true
        return window.matchMedia('(min-width: 768px)').matches
    })
    const [transferTask, setTransferTask] = useState<{
        task: SimulationTask
        from: { left: number; top: number; width: number; height: number }
        to: { left: number; top: number; width: number; height: number }
    } | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!('matchMedia' in window)) return
        const mql = window.matchMedia('(min-width: 768px)')
        const onChange = () => setIsMdUp(mql.matches)
        onChange()
        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
    }, [])

    function getFirstVisibleEl(selector: string): HTMLElement | null {
        const nodes = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
        for (const el of nodes) {
            const r = el.getBoundingClientRect()
            if (r.width > 1 && r.height > 1) return el
        }
        return null
    }

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

    useLayoutEffect(() => {
        navDeltaRef.current = currentStepIndex - prevStepIndexRef.current
        prevStepIndexRef.current = currentStepIndex

        setTransferTask(null)
        setEngineHoldTaskId(null)
        setZoneFlights([])
        setHiddenTaskIds(new Set())

        const shouldAnimate = steps.length > 0 && navDeltaRef.current === 1 && status !== 'idle'

        transitionCycleClosedRef.current = false
        animationsInFlightRef.current = 0
        flightHiddenIdsRef.current = new Set()
        zoneFlightRemainingRef.current = 0
        shouldAutoAdvanceRef.current = status === 'running' && shouldAnimate
        transitionStepRef.current = shouldAutoAdvanceRef.current ? currentStepIndex : null

        if (!shouldAnimate) {
            prevDomTasksRef.current = new Map()
            lastFlightStepRef.current = null
            shouldAutoAdvanceRef.current = false
            transitionStepRef.current = null
        }
    }, [currentStepIndex, status, steps.length])

    const prevStatusRef = useRef(status)
    useEffect(() => {
        const prevStatus = prevStatusRef.current
        prevStatusRef.current = status

        const justStartedRunning = status === 'running' && prevStatus !== 'running'
        if (!justStartedRunning) return
        if (steps.length === 0) return

        const isLastStep = currentStepIndex >= steps.length - 1
        if (isLastStep) {
            if (simulation.playback.autoplay) {
                dispatch(goToStep(0))
                dispatch(nextStep())
            }
            return
        }

        dispatch(nextStep())
    }, [status, steps.length, currentStepIndex, simulation.playback.autoplay, dispatch])

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

    const advanceAfterAnimations = () => {
        if (status !== 'running') return
        if (steps.length === 0) return
        if (transitionStepRef.current !== currentStepIndex) return

        const isLastStep = currentStepIndex >= steps.length - 1
        if (!isLastStep) {
            dispatch(nextStep())
            return
        }

        if (simulation.playback.autoplay) {
            dispatch(goToStep(0))
            dispatch(play())
            return
        }

        dispatch(pause())
    }

    const registerAnimations = (count: number) => {
        if (!shouldAutoAdvanceRef.current) return
        if (transitionStepRef.current !== currentStepIndex) return
        if (count <= 0) return
        animationsInFlightRef.current += count
    }

    const completeOneAnimation = () => {
        if (!shouldAutoAdvanceRef.current) return
        if (transitionStepRef.current !== currentStepIndex) return

        animationsInFlightRef.current = Math.max(0, animationsInFlightRef.current - 1)
        if (!transitionCycleClosedRef.current) return
        if (animationsInFlightRef.current !== 0) return

        advanceAfterAnimations()
    }

    useLayoutEffect(() => {
        const nextTaskId = jsEngineTask?.id ?? null
        const prevTaskId = lastEngineTaskIdRef.current
        lastEngineTaskIdRef.current = nextTaskId

        const shouldAnimate = steps.length > 0 && navDeltaRef.current === 1 && status !== 'idle'

        if (!nextTaskId) return
        if (prevTaskId === nextTaskId) return
        if (!jsEngineTask) return
        if (!shouldAnimate) return

        const fromEl = getFirstVisibleEl('[data-sim-timeline-active="true"]')
        const toEl =
            (document.querySelector(
                `[data-sim-task-id="${nextTaskId}"][data-sim-zone="engine"]`,
            ) as HTMLElement | null) ??
            (document.querySelector('[data-sim-js-engine="true"]') as HTMLElement | null)
        if (!fromEl || !toEl) return

        const from = fromEl.getBoundingClientRect()
        const to = toEl.getBoundingClientRect()

        const width = to.width
        const height = to.height
        const fromLeft = from.left + (from.width - width) / 2
        const fromTop = from.top + (from.height - height) / 2

        setEngineHoldTaskId(nextTaskId)
        registerAnimations(1)
        setTransferTask({
            task: jsEngineTask,
            from: { left: fromLeft, top: fromTop, width, height },
            to: { left: to.left, top: to.top, width, height },
        })
    }, [jsEngineTask, status, currentStepIndex])

    useLayoutEffect(() => {
        if (!currentStep) return
        const shouldAnimate = steps.length > 0 && navDeltaRef.current === 1 && status !== 'idle'
        if (!shouldAnimate) {
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

        if (lastFlightStepRef.current === currentStepIndex) {
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

        registerAnimations(flights.length)
        zoneFlightRemainingRef.current = flights.length
        flightHiddenIdsRef.current = hide
        setZoneFlights(flights)
        setHiddenTaskIds((prev) => {
            const merged = new Set(prev)
            hide.forEach((id) => merged.add(id))
            return merged
        })
    }, [currentStepIndex, currentStep, steps, status])

    useEffect(() => {
        if (!shouldAutoAdvanceRef.current) return
        if (transitionStepRef.current !== currentStepIndex) return

        transitionCycleClosedRef.current = true
        if (animationsInFlightRef.current === 0) {
            queueMicrotask(() => {
                if (transitionStepRef.current !== currentStepIndex) return
                if (!shouldAutoAdvanceRef.current) return
                if (animationsInFlightRef.current !== 0) return
                advanceAfterAnimations()
            })
        }
    }, [currentStepIndex])

    return (
        <section className="flex min-w-0 flex-1 flex-col rounded-xl bg-bg-block lg:h-full lg:min-h-0 lg:overflow-hidden">
            <header className="sticky top-0 z-50 flex flex-row items-center justify-between gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1 md:static">
                <div className="min-w-0" />
                <div className="min-w-0 flex-1">
                    <SimulationControls simulation={simulation} />
                </div>
            </header>

            {!isMdUp && isStepsHistoryOpen ? (
                <section className="border-b border-border-subtle bg-bg-panel/30 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
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

                    <div className="mt-3 max-h-[50dvh] overflow-auto">
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
                                            key={`step-history-inline-${idx}`}
                                            type="button"
                                            onClick={() => dispatch(goToStep(idx))}
                                            className={cn(
                                                'w-full rounded-lg border px-3 py-2 text-left text-[11px] md:text-xs',
                                                'transition-colors',
                                                isActive
                                                    ? 'border-accent-gold/40 bg-accent-gold/10 text-text-primary'
                                                    : 'border-border-subtle bg-bg-block/40 text-slate-200/85 hover:bg-bg-block-hover',
                                            )}
                                        >
                                            <span className="font-mono text-[11px] text-slate-400">
                                                {idx + 1}
                                            </span>
                                            <span className="mx-2 text-slate-500">→</span>
                                            <span className="text-[11px] md:text-xs">
                                                {s.description ?? '—'}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </section>
            ) : null}

            <div className="px-3 pt-2 sm:px-4 sm:pt-3">
                <div className="rounded-xl border border-border-subtle bg-bg-panel/60 px-3 py-1.5 shadow-md sm:px-4 sm:py-3">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-200/85">
                            <span className="mr-2 font-mono text-[12px] text-slate-400">
                                {steps.length ? `${currentStepIndex + 1}/${steps.length}` : '—'}
                            </span>
                            <span className="mr-2 text-slate-500">→</span>
                            {programBlocks.length === 0
                                ? 'Selecione os blocos disponíveis e clique em Gerar para iniciar a simulação.'
                                : (currentStep?.description ??
                                  'Clique em Gerar para iniciar a simulação.')}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsStepsHistoryOpen((prev) => (isMdUp ? true : !prev))}
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

            <main className="flex flex-1 gap-3 p-4 sm:gap-4 lg:min-h-0 lg:overflow-hidden">
                <LayoutGroup>
                    <div className="hidden w-56 shrink-0 md:block">
                        <CodeTimeline
                            blocks={blocksWithState}
                            currentIndex={currentStepIndex}
                            isRunning={status === 'running'}
                        />
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-4 lg:overflow-hidden">
                        <div className="shrink-0 md:hidden">
                            <div className="h-28 sm:h-32">
                                <CodeTimeline
                                    blocks={blocksWithState}
                                    currentIndex={currentStepIndex}
                                    isRunning={status === 'running'}
                                />
                            </div>
                        </div>

                        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:overflow-hidden">
                            <div className="min-w-0">
                                <EventLoopZone
                                    status={status}
                                    hasBuilt={steps.length > 0}
                                    transitTask={eventLoopTransitTask}
                                />
                            </div>

                            <div className="flex min-h-0 min-w-0 flex-col lg:overflow-hidden">
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
                              duration: transferAnimDurationS,
                              ease: [0.22, 1, 0.36, 1],
                          }}
                          onAnimationComplete={() => {
                              setTransferTask(null)
                              setEngineHoldTaskId(null)
                              completeOneAnimation()
                          }}
                          style={{
                              position: 'fixed',
                              zIndex: 9999,
                              pointerEvents: 'none',
                          }}
                          className={cn(
                              'rounded-xl border bg-bg-block-strong px-2 py-1.5 text-[11px] text-text-primary shadow-xl sm:px-3 sm:py-2 sm:text-xs',
                              'flex items-center gap-2',
                              getTaskBorderClasses(transferTask.task.source),
                          )}
                      >
                          {transferTask.task.label}
                      </motion.div>,
                      document.body,
                  )
                : null}

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
                                      duration: transferAnimDurationS,
                                      ease: [0.22, 1, 0.36, 1],
                                  }}
                                  onAnimationComplete={() => {
                                      zoneFlightRemainingRef.current = Math.max(
                                          0,
                                          zoneFlightRemainingRef.current - 1,
                                      )

                                      if (zoneFlightRemainingRef.current === 0) {
                                          const hide = flightHiddenIdsRef.current
                                          setZoneFlights([])
                                          setHiddenTaskIds((prev) => {
                                              const next = new Set(prev)
                                              hide.forEach((id) => next.delete(id))
                                              return next
                                          })
                                          flightHiddenIdsRef.current = new Set()
                                      }

                                      completeOneAnimation()
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

            {isMdUp
                ? createPortal(
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
                                                              onClick={() =>
                                                                  dispatch(goToStep(idx))
                                                              }
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
                  )
                : null}
        </section>
    )
}
