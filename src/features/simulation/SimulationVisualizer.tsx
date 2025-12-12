import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    selectCurrentBlockHash,
    selectIsSimulationStale,
    selectSimulationState,
    selectBlocksWithTimelineState,
} from './selector'

import BuildSimulationButton from './BuildSimulationButton'
import Zone from './Zone'
import TaskCard from './TaskCard'
import SimulationControls from './SimulationControls'
import EventLoopZone from './EventLoopZone'
import JsEngineProcessor from './JsEngineProcessor'
import CodeTimeline from './CodeTimeline'
import ConsoleOutput from './ConsoleOutput'
import { useEffect, useMemo } from 'react'
import { goToStep, nextStep, pause, play, resetSimulation } from './simulationSlice'
import { LayoutGroup } from 'framer-motion'
import { selectProgramBlocks } from '../program/programSlice'

export default function SimulationVisualizer() {
    const dispatch = useAppDispatch()
    const simulation = useAppSelector(selectSimulationState)
    const { steps, currentStepIndex, status, playback } = simulation
    const currentStep = steps[currentStepIndex] ?? steps.at(-1)
    const previousStep = steps[currentStepIndex - 1]

    const previousLineCount = useMemo(() => {
        return previousStep?.consoleOutput.length ?? 0
    }, [previousStep])

    const isStale = useAppSelector(selectIsSimulationStale)
    const currentBlockHash = useAppSelector(selectCurrentBlockHash)
    const blocksWithState = useAppSelector(selectBlocksWithTimelineState)
    const programBlocks = useAppSelector(selectProgramBlocks)

    // Task que está transitando pelo Event Loop (saiu da fila, ainda não entrou na Call Stack)
    const eventLoopTransitTask = currentStep?.currentlyProcessing ?? null

    // Task que está no JS Engine (antes de ir para Call Stack ou filas)
    const jsEngineTask = currentStep?.jsEngineTask ?? null

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
            } else if (playback.autoplay) {
                dispatch(goToStep(0))
                dispatch(play())
            } else {
                dispatch(pause())
            }
        }, playback.speedMs)

        return () => clearTimeout(timeoutId)
    }, [status, steps.length, currentStepIndex, playback.speedMs, playback.autoplay, dispatch])

    return (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl bg-bg-block">
            <header className="flex flex-row items-center justify-between gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1">
                <div className="flex flex-row gap-4">
                    <h2 className="font-bold tracking-wide text-text-primary uppercase">
                        Event Loop Visualizer
                    </h2>
                    <BuildSimulationButton currentBlockHash={currentBlockHash} isStale={isStale} />
                </div>
                <SimulationControls simulation={simulation} />
            </header>

            <div className="border-b border-slate-800/50 bg-slate-900/30 px-5 py-2">
                <p className="text-sm text-slate-300/80">
                    {programBlocks.length === 0
                        ? 'Selecione os blocos disponíveis e clique em Build para iniciar a simulação.'
                        : (currentStep?.description ?? 'Clique em Build para iniciar a simulação.')}
                </p>
            </div>

            <main className="flex flex-1 gap-4 overflow-hidden p-4">
                <LayoutGroup>
                    <div className="hidden w-48 shrink-0 md:block">
                        <CodeTimeline blocks={blocksWithState} currentIndex={currentStepIndex} />
                    </div>

                    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                        <div className="flex flex-1 items-start gap-6 overflow-hidden">
                            <div className="shrink-0">
                                <EventLoopZone
                                    status={status}
                                    hasBuilt={steps.length > 0}
                                    transitTask={eventLoopTransitTask}
                                />
                            </div>

                            <div className="flex flex-1 flex-col items-center justify-start gap-6">
                                <div className="flex flex-row items-start gap-6">
                                    <Zone title="Call Stack">
                                        {currentStep?.callStack.map((task) => (
                                            <TaskCard key={task.id} task={task} isWaiting={false} />
                                        ))}
                                    </Zone>
                                    <Zone title="Microtask Queue" variant="microtask">
                                        {currentStep?.microTaskQueue.map((task) => (
                                            <TaskCard key={task.id} task={task} isWaiting={true} />
                                        ))}
                                    </Zone>
                                </div>
                                <div className="flex flex-row items-start gap-6">
                                    <Zone title="Web APIs" variant="webapi">
                                        {currentStep?.webApis.map((task) => (
                                            <TaskCard key={task.id} task={task} isWaiting={true} />
                                        ))}
                                    </Zone>
                                    <Zone title="Macrotask Queue" variant="macrotask">
                                        {currentStep?.macroTaskQueue.map((task) => (
                                            <TaskCard key={task.id} task={task} isWaiting={true} />
                                        ))}
                                    </Zone>
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <JsEngineProcessor currentTask={jsEngineTask} />
                        </div>
                    </div>
                </LayoutGroup>
            </main>

            <div className="shrink-0 border-t border-slate-800 p-4">
                <section className="flex h-32 flex-col rounded-xl border border-slate-800 bg-black/60 p-3">
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
        </section>
    )
}
