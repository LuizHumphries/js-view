import {
    LucideFastForward,
    LucidePause,
    LucidePlay,
    LucideRotateCcw,
    LucideStepBack,
    LucideStepForward,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    selectCurrentBlockHash,
    selectCurrentSimulationStep,
    selectIsSimulationStale,
    selectSimulationState,
} from './selector'
import {
    goToEnd,
    goToStep,
    nextStep,
    pause,
    play,
    prevStep,
    setPlayback,
    setSpeedMs,
} from './simulationSlice'
import { Button, Switch } from '@base-ui-components/react'
import { useEffect } from 'react'
import { cn } from '../../utils/cn'
import BuildSimulationButton from './BuildSimulationButton'

const MIN_DELAY = 250
const MAX_DELAY = 1250

export default function SimulationVisualizer() {
    const dispatch = useAppDispatch()
    const simulation = useAppSelector(selectSimulationState)
    const isStale = useAppSelector(selectIsSimulationStale)
    const currentBlockHash = useAppSelector(selectCurrentBlockHash)

    const delay = simulation.playback.speedMs
    const range = MAX_DELAY - MIN_DELAY
    const clampedDelay = Math.min(Math.max(delay, MIN_DELAY), MAX_DELAY)
    const t = (MAX_DELAY - clampedDelay) / range
    const sliderValue = Math.round(t * 100)

    const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const slider = Number(event.target.value)

        const t = slider / 100
        const delay = MAX_DELAY - t * (MAX_DELAY - MIN_DELAY)
        dispatch(setSpeedMs(Math.round(delay)))
    }

    const step = useAppSelector(selectCurrentSimulationStep)
    const hasSimulation = !!step

    useEffect(() => {
        if (simulation.status !== 'running') return
        if (!simulation.steps.length) return

        const isLastStep = simulation.currentStepIndex >= simulation.steps.length - 1

        const id = setTimeout(() => {
            if (!isLastStep) {
                dispatch(nextStep())
                return
            }

            if (simulation.playback.autoplay) {
                dispatch(goToStep(0))
                dispatch(play())
            }
        }, simulation.playback.speedMs || 1000)
        return () => clearTimeout(id)
    }, [
        simulation.status,
        simulation.currentStepIndex,
        simulation.playback.speedMs,
        simulation.steps.length,
        simulation.playback.autoplay,
        dispatch,
    ])

    return (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl bg-bg-block">
            <header className="flex flex-row items-center justify-between gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1">
                <div className="flex flex-row gap-4">
                    <h2 className="font-bold tracking-wide text-text-primary uppercase">
                        Event Loop Visualizer
                    </h2>
                    <BuildSimulationButton currentBlockHash={currentBlockHash} isStale={isStale} />
                </div>
                <div className="flex flex-row gap-5">
                    <div className="flex items-center gap-3 rounded-full bg-bg-block/70 px-2 py-1">
                        <Button
                            aria-label="Play"
                            title="Play"
                            onClick={() => dispatch(play())}
                            className={cn(
                                'rounded-full p-1 transition-all duration-300',
                                hasSimulation && simulation.status !== 'running'
                                    ? 'animate-pulse bg-accent-success/20 text-accent-success shadow-glow-success hover:bg-accent-success/30'
                                    : 'text-text-muted/50 hover:text-text-muted',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucidePlay className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Pause"
                            title="Pause"
                            onClick={() => dispatch(pause())}
                            className={cn(
                                'rounded-full p-1 transition-all duration-200',
                                simulation.status === 'running'
                                    ? 'text-accent-warning hover:bg-accent-warning/20'
                                    : 'text-text-muted/40 hover:text-text-muted/60',
                                'disabled:opacity-30',
                            )}
                        >
                            <LucidePause className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Previous step"
                            onClick={() => dispatch(prevStep())}
                            className="p-1 text-text-muted/40 transition-colors hover:text-text-muted disabled:opacity-30"
                        >
                            <LucideStepBack className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Next step"
                            onClick={() => dispatch(nextStep())}
                            className="p-1 text-text-muted/40 transition-colors hover:text-text-muted disabled:opacity-30"
                        >
                            <LucideStepForward className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Reset"
                            onClick={() => dispatch(goToStep(0))}
                            className="p-1 text-text-muted/40 transition-colors hover:text-text-muted disabled:opacity-30"
                        >
                            <LucideRotateCcw className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="End"
                            onClick={() => dispatch(goToEnd())}
                            className="p-1 text-text-muted/40 transition-colors hover:text-text-muted disabled:opacity-30"
                        >
                            <LucideFastForward className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-text-primary">Speed</span>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={sliderValue}
                            onChange={handleSpeedChange}
                            className="h-1 w-24"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-text-primary">Autoplay</span>
                        <Switch.Root
                            checked={simulation.playback.autoplay}
                            onCheckedChange={(checked) => {
                                dispatch(setPlayback({ autoplay: checked }))
                            }}
                            className="relative flex h-6 w-10 rounded-full bg-gradient-to-r from-gray-700 from-35% to-gray-200 to-65% bg-[length:6.5rem_100%] bg-[100%_0%] bg-no-repeat p-px shadow-[inset_0_1.5px_2px] shadow-gray-200 outline outline-1 -outline-offset-1 outline-gray-200 transition-[background-position,box-shadow] duration-[125ms] ease-[cubic-bezier(0.26,0.75,0.38,0.45)] before:absolute before:rounded-full before:outline-offset-2 before:outline-blue-800 focus-visible:before:inset-0 focus-visible:before:outline focus-visible:before:outline-2 active:bg-gray-100 data-[checked]:bg-[0%_0%] data-[checked]:active:bg-gray-500 dark:from-gray-500 dark:shadow-black/75 dark:outline-white/15 dark:data-[checked]:shadow-none"
                        >
                            <Switch.Thumb className="aspect-square h-full rounded-full bg-white shadow-[0_0_1px_1px,0_1px_1px,1px_2px_4px_-1px] shadow-gray-100 transition-transform duration-150 data-[checked]:translate-x-4 dark:shadow-black/25" />
                        </Switch.Root>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 flex-col overflow-hidden p-5">
                <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
                    <div className="flex flex-col gap-3">
                        <Panel title="Call Stack" borderColor="border-zone-callstack/40">
                            {hasSimulation ? (
                                step.callStack.length === 0 ? (
                                    <EmptyHint>empty</EmptyHint>
                                ) : (
                                    <ul className="space-y-1 text-[11px]">
                                        {step.callStack.map((frame, idx) => (
                                            <li
                                                key={`${frame}-${idx}`}
                                                className="rounded-md border border-accent-console/40 bg-bg-block-strong/60 px-2 py-1"
                                            >
                                                {frame}
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                <WaitingHint />
                            )}
                        </Panel>

                        <Panel title="Web APIs" borderColor="border-zone-webapi/40">
                            {hasSimulation ? (
                                step.webApis.length === 0 ? (
                                    <EmptyHint>no active timers / tasks</EmptyHint>
                                ) : (
                                    <ul className="space-y-1 text-[11px]">
                                        {step.webApis.map((api, idx) => (
                                            <li
                                                key={`${api}-${idx}`}
                                                className="rounded-md border border-accent-timeout/40 bg-bg-block-strong/60 px-2 py-1"
                                            >
                                                {api}
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                <WaitingHint />
                            )}
                        </Panel>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Panel title="Microtask Queue" borderColor="border-zone-microtask/40">
                            {hasSimulation ? (
                                step.microTaskQueue.length === 0 ? (
                                    <EmptyHint>empty</EmptyHint>
                                ) : (
                                    <ul className="space-y-1 text-[11px]">
                                        {step.microTaskQueue.map((task, idx) => (
                                            <li
                                                key={`${task}-${idx}`}
                                                className="rounded-md border border-accent-promiseThen/40 bg-bg-block-strong/60 px-2 py-1"
                                            >
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                <WaitingHint />
                            )}
                        </Panel>

                        <Panel title="Macrotask Queue" borderColor="border-zone-macrotask/40">
                            {hasSimulation ? (
                                step.macroTaskQueue.length === 0 ? (
                                    <EmptyHint>empty</EmptyHint>
                                ) : (
                                    <ul className="space-y-1 text-[11px]">
                                        {step.macroTaskQueue.map((task, idx) => (
                                            <li
                                                key={`${task}-${idx}`}
                                                className="rounded-md border border-accent-timeout/40 bg-bg-block-strong/60 px-2 py-1"
                                            >
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                <WaitingHint />
                            )}
                        </Panel>
                    </div>
                </div>
                <div className="col-span-2 mt-3 shrink-0">
                    <Panel title="Console Output (>)">
                        {hasSimulation ? (
                            step.consoleOutput.length === 0 ? (
                                <pre className="h-40 overflow-y-auto bg-bg-console/80 p-2 font-mono text-[11px] text-accent-console">
                                    No logs yet
                                </pre>
                            ) : (
                                <pre className="h-40 overflow-y-auto bg-bg-console/80 p-2 font-mono text-[11px] text-accent-console">
                                    {step.consoleOutput.join('\n')}
                                </pre>
                            )
                        ) : (
                            <pre className="h-40 overflow-y-auto bg-bg-console/80 p-2 font-mono text-[11px] text-accent-console">
                                Construa a simulação para visualizar o output
                            </pre>
                        )}
                    </Panel>
                </div>
            </main>
        </section>
    )
}

// Helpers internos ao arquivo, pra não poluir o componente principal
type PanelProps = {
    title: string
    borderColor?: string
    children: React.ReactNode
}

function Panel({ title, borderColor = '', children }: PanelProps) {
    return (
        <div
            className={cn(
                'flex flex-col rounded-xl border border-border-subtle bg-bg-block/80 p-2',
                borderColor,
            )}
        >
            <h3 className="mb-1 text-[10px] font-semibold tracking-wide text-text-primary uppercase">
                {title}
            </h3>
            {children}
        </div>
    )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] text-text-primary/70 italic">{children}</p>
}

function WaitingHint() {
    return <p className="py-2 text-center text-[10px] text-text-muted/50 italic">—</p>
}
