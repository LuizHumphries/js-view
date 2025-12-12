import { Button, Switch } from '@base-ui-components/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type { SimulationState } from './simulationSlice'
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
import { cn } from '../../utils/cn'
import {
    LucideFastForward,
    LucidePause,
    LucidePlay,
    LucideRotateCcw,
    LucideStepBack,
    LucideStepForward,
} from 'lucide-react'
import { selectHasBuiltSimulation } from './selector'

type SimulationControlsProps = {
    simulation: SimulationState
}

const MIN_DELAY = 250
const MAX_DELAY = 1250

export default function SimulationControls({ simulation }: SimulationControlsProps) {
    const dispatch = useAppDispatch()
    const hasSimulation = useAppSelector(selectHasBuiltSimulation)

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

    return (
        <div className="flex flex-row gap-5">
            <div className="flex items-center gap-3 rounded-full bg-bg-block/70 px-2 py-1">
                <Button
                    aria-label="Play"
                    title="Play"
                    disabled={!hasSimulation}
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
                    disabled={!hasSimulation}
                    onClick={() => dispatch(pause())}
                    className={cn(
                        'rounded-full p-1 transition-all duration-200',
                        simulation.status === 'running'
                            ? 'text-accent-warning hover:bg-accent-warning/20'
                            : 'text-text-muted/40 hover:text-text-muted/60',
                        'disabled:cursor-not-allowed disabled:opacity-30',
                    )}
                >
                    <LucidePause className="h-5 w-5" />
                </Button>
                <Button
                    aria-label="Previous step"
                    disabled={!hasSimulation}
                    onClick={() => dispatch(prevStep())}
                    className="p-1 text-text-muted/40 transition-colors hover:text-text-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <LucideStepBack className="h-5 w-5" />
                </Button>
                <Button
                    aria-label="Next step"
                    disabled={!hasSimulation}
                    onClick={() => dispatch(nextStep())}
                    className="p-1 text-text-muted/40 transition-colors hover:text-text-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <LucideStepForward className="h-5 w-5" />
                </Button>
                <Button
                    aria-label="Reset"
                    disabled={!hasSimulation}
                    onClick={() => dispatch(goToStep(0))}
                    className="p-1 text-text-muted/40 transition-colors hover:text-text-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <LucideRotateCcw className="h-5 w-5" />
                </Button>
                <Button
                    aria-label="End"
                    disabled={!hasSimulation}
                    onClick={() => dispatch(goToEnd())}
                    className="p-1 text-text-muted/40 transition-colors hover:text-text-muted disabled:cursor-not-allowed disabled:opacity-30"
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
                    className="relative flex h-6 w-10 rounded-full bg-linear-to-r from-gray-700 from-35% to-gray-200 to-65% bg-size-[6.5rem_100%] bg-position-[100%_0%] bg-no-repeat p-px shadow-[inset_0_1.5px_2px] shadow-gray-200 outline outline-1 -outline-offset-1 outline-gray-200 transition-[background-position,box-shadow] duration-[125ms] ease-[cubic-bezier(0.26,0.75,0.38,0.45)] before:absolute before:rounded-full before:outline-offset-2 before:outline-blue-800 focus-visible:before:inset-0 focus-visible:before:outline focus-visible:before:outline-2 active:bg-gray-100 data-[checked]:bg-[0%_0%] data-[checked]:active:bg-gray-500 dark:from-gray-500 dark:shadow-black/75 dark:outline-white/15 dark:data-[checked]:shadow-none"
                >
                    <Switch.Thumb className="aspect-square h-full rounded-full bg-white shadow-[0_0_1px_1px,0_1px_1px,1px_2px_4px_-1px] shadow-gray-100 transition-transform duration-150 data-[checked]:translate-x-4 dark:shadow-black/25" />
                </Switch.Root>
            </div>
        </div>
    )
}
