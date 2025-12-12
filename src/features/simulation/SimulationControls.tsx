import { Button, Switch } from '@base-ui-components/react'
import { Slider } from '@base-ui-components/react/slider'
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
    setTransferAnimMs,
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

const MIN_TRANSFER = 150
const MAX_TRANSFER = 2000

export default function SimulationControls({ simulation }: SimulationControlsProps) {
    const dispatch = useAppDispatch()
    const hasSimulation = useAppSelector(selectHasBuiltSimulation)

    const transferDelay = simulation.ui.transferAnimMs
    const transferRange = MAX_TRANSFER - MIN_TRANSFER
    const clampedTransfer = Math.min(Math.max(transferDelay, MIN_TRANSFER), MAX_TRANSFER)
    // Direita = mais rápido => menor ms
    const transferT = (MAX_TRANSFER - clampedTransfer) / transferRange
    const transferSliderValue = Math.round(transferT * 100)

    const totalSteps = simulation.steps.length
    const currentStepHuman = totalSteps ? Math.min(simulation.currentStepIndex + 1, totalSteps) : 0

    return (
        <div className="relative z-30 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-bg-block/70 px-2 py-1">
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
                <span className="ml-1 hidden text-[10px] text-text-muted sm:inline">
                    {totalSteps ? `Step ${currentStepHuman}/${totalSteps}` : '—'}
                </span>
            </div>
            <details className="relative min-[1680px]:hidden">
                <summary className="inline-flex cursor-pointer rounded-full bg-bg-block/70 px-5 py-1 text-xs whitespace-nowrap text-text-primary">
                    Mais
                </summary>
                <div className="absolute right-0 z-60 mt-2 w-64 rounded-xl border border-border-subtle bg-bg-panel p-3 shadow-lg">
                    {/* Ações: botões full-width, com espaçamento padrão */}
                    <div className="flex flex-col gap-2">
                        <Button
                            aria-label="Previous step"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(prevStep())}
                            className={cn(
                                'flex w-full items-center justify-between rounded-lg border border-border-subtle bg-bg-block/40 px-3 py-2',
                                'text-xs font-semibold text-text-primary transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <span>Anterior</span>
                            <LucideStepBack className="h-4 w-4 text-text-muted/70" />
                        </Button>
                        <Button
                            aria-label="Next step"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(nextStep())}
                            className={cn(
                                'flex w-full items-center justify-between rounded-lg border border-border-subtle bg-bg-block/40 px-3 py-2',
                                'text-xs font-semibold text-text-primary transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <span>Próximo</span>
                            <LucideStepForward className="h-4 w-4 text-text-muted/70" />
                        </Button>
                        <Button
                            aria-label="Reset"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(goToStep(0))}
                            className={cn(
                                'flex w-full items-center justify-between rounded-lg border border-border-subtle bg-bg-block/40 px-3 py-2',
                                'text-xs font-semibold text-text-primary transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <span>Reset</span>
                            <LucideRotateCcw className="h-4 w-4 text-text-muted/70" />
                        </Button>
                        <Button
                            aria-label="End"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(goToEnd())}
                            className={cn(
                                'flex w-full items-center justify-between rounded-lg border border-border-subtle bg-bg-block/40 px-3 py-2',
                                'text-xs font-semibold text-text-primary transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <span>Ir pro fim</span>
                            <LucideFastForward className="h-4 w-4 text-text-muted/70" />
                        </Button>
                    </div>

                    {/* Controles: mais "respiro" entre botões e sliders */}
                    <div className="mt-5 space-y-5 border-t border-border-subtle pt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-24 shrink-0 text-[10px] text-text-primary">
                                Velocidade de deslocamento
                            </span>
                            <Slider.Root
                                min={0}
                                max={100}
                                step={5}
                                value={[transferSliderValue]}
                                onValueChange={(value) => {
                                    const v = Array.isArray(value) ? value[0] : value
                                    const t = v / 100
                                    const ms = MAX_TRANSFER - t * (MAX_TRANSFER - MIN_TRANSFER)
                                    dispatch(setTransferAnimMs(Math.round(ms)))
                                }}
                                className="flex flex-1 items-center"
                            >
                                <Slider.Control className="w-full px-1">
                                    <Slider.Track className="relative h-1 w-full rounded-full bg-bg-block-strong">
                                        <Slider.Indicator className="absolute inset-y-0 left-0 rounded-full bg-accent-gold" />
                                        <Slider.Thumb className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-border-subtle bg-bg-panel shadow-card-soft outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/60" />
                                    </Slider.Track>
                                </Slider.Control>
                            </Slider.Root>
                        </div>
                    </div>

                    {/* Switch: mais para baixo e separado visualmente */}
                    <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
                        <span className="text-[10px] text-text-primary">Repetir</span>
                        <Switch.Root
                            checked={simulation.playback.autoplay}
                            onCheckedChange={(checked) => {
                                dispatch(setPlayback({ autoplay: checked }))
                            }}
                            className="relative flex h-6 w-11 items-center rounded-full border border-border-subtle bg-bg-block-hover p-0.5 transition-colors data-checked:bg-accent-gold/20"
                        >
                            <Switch.Thumb className="h-5 w-5 rounded-full bg-bg-panel shadow-card-soft transition-transform duration-200 data-checked:translate-x-5" />
                        </Switch.Root>
                    </div>
                </div>
            </details>
            <div className="hidden min-[1680px]:flex min-[1680px]:flex-row min-[1680px]:gap-5">
                <div className="flex items-center gap-3 rounded-full bg-bg-block/70 px-2 py-1">
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
                    <span className="ml-1 text-[10px] text-text-muted">
                        {totalSteps ? `Step ${currentStepHuman}/${totalSteps}` : '—'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-[10px] text-text-primary">
                        Velocidade de deslocamento
                    </span>
                    <Slider.Root
                        min={0}
                        max={100}
                        step={5}
                        value={[transferSliderValue]}
                        onValueChange={(value) => {
                            const v = Array.isArray(value) ? value[0] : value
                            const t = v / 100
                            const ms = MAX_TRANSFER - t * (MAX_TRANSFER - MIN_TRANSFER)
                            dispatch(setTransferAnimMs(Math.round(ms)))
                        }}
                        className="flex w-40 items-center"
                    >
                        <Slider.Control className="w-full px-2">
                            <Slider.Track className="relative h-1 w-full rounded-full bg-bg-block-strong">
                                <Slider.Indicator className="absolute inset-y-0 left-0 rounded-full bg-accent-gold" />
                                <Slider.Thumb className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-border-subtle bg-bg-panel shadow-card-soft outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/60" />
                            </Slider.Track>
                        </Slider.Control>
                    </Slider.Root>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-text-primary">Repetir</span>
                    <Switch.Root
                        checked={simulation.playback.autoplay}
                        onCheckedChange={(checked) => {
                            dispatch(setPlayback({ autoplay: checked }))
                        }}
                        className="relative flex h-6 w-11 items-center rounded-full border border-border-subtle bg-bg-block-hover p-0.5 transition-colors data-checked:bg-accent-gold/20"
                    >
                        <Switch.Thumb className="h-5 w-5 rounded-full bg-bg-panel shadow-card-soft transition-transform duration-200 data-checked:translate-x-5" />
                    </Switch.Root>
                </div>
            </div>
        </div>
    )
}
