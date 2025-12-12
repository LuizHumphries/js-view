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
    setTransferAnimSpeed,
} from './simulationSlice'
import { cn } from '../../utils/cn'
import {
    LucideChevronDown,
    LucideChevronUp,
    LucideFastForward,
    LucidePause,
    LucidePlay,
    LucideRotateCcw,
    LucideStepBack,
    LucideStepForward,
    LucideX,
} from 'lucide-react'
import { selectHasBuiltSimulation } from './selector'
import { useState } from 'react'

type SimulationControlsProps = {
    simulation: SimulationState
}

export default function SimulationControls({ simulation }: SimulationControlsProps) {
    const dispatch = useAppDispatch()
    const hasSimulation = useAppSelector(selectHasBuiltSimulation)
    const [isMoreOpen, setIsMoreOpen] = useState(true)

    const transferSliderValue = simulation.ui.transferAnimSpeed

    const totalSteps = simulation.steps.length
    const currentStepHuman = totalSteps ? Math.min(simulation.currentStepIndex + 1, totalSteps) : 0

    return (
        <>
            <div className="relative z-30 flex w-full items-center gap-2">
                <div className="flex items-center gap-2">
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
                    {totalSteps ? (
                        <span className="ml-1 hidden text-[10px] text-text-muted sm:inline">
                            {`Step ${currentStepHuman}/${totalSteps}`}
                        </span>
                    ) : null}

                    {/* Mobile landscape (sm..<md): controles de step ao lado do play/pause */}
                    <div className="hidden items-center gap-1 sm:flex md:hidden">
                        <Button
                            aria-label="Anterior"
                            title="Anterior"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(prevStep())}
                            className={cn(
                                'rounded-full p-1.5 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideStepBack className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Próximo"
                            title="Próximo"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(nextStep())}
                            className={cn(
                                'rounded-full p-1.5 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideStepForward className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Reset"
                            title="Reset"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(goToStep(0))}
                            className={cn(
                                'rounded-full p-1.5 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideRotateCcw className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Ir pro fim"
                            title="Ir pro fim"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(goToEnd())}
                            className={cn(
                                'rounded-full p-1.5 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideFastForward className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Desktop (md+): controles de step na MESMA linha do play/pause */}
                    <div className="hidden items-center gap-2 md:flex">
                        <Button
                            aria-label="Anterior"
                            title="Anterior"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(prevStep())}
                            className={cn(
                                'rounded-full p-2 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideStepBack className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Próximo"
                            title="Próximo"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(nextStep())}
                            className={cn(
                                'rounded-full p-2 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideStepForward className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Reset"
                            title="Reset"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(goToStep(0))}
                            className={cn(
                                'rounded-full p-2 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideRotateCcw className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Ir pro fim"
                            title="Ir pro fim"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(goToEnd())}
                            className={cn(
                                'rounded-full p-2 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideFastForward className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Botão abrir/fechar só no mobile (<md). Em md+ não existe toggle. */}
                <div className="ml-auto md:hidden">
                    <Button
                        type="button"
                        aria-label={isMoreOpen ? 'Fechar controles' : 'Abrir controles'}
                        title={isMoreOpen ? 'Fechar' : 'Mais'}
                        onClick={() => setIsMoreOpen((v) => !v)}
                        className={cn(
                            'inline-flex items-center justify-center rounded-full p-2',
                            'text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                        )}
                    >
                        {isMoreOpen ? (
                            <LucideChevronUp className="h-5 w-5" />
                        ) : (
                            <LucideChevronDown className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Toolbar extra: em md+ sempre visível; em mobile só aparece se isMoreOpen */}
            <div className={cn('mt-1', 'md:mt-0')}>
                <div
                    className={cn(
                        'hidden md:flex',
                        isMoreOpen ? 'flex md:flex' : 'hidden md:flex',
                        'w-full flex-col gap-2 md:flex-row md:items-center md:gap-2',
                    )}
                >
                    {/* Mobile pequeno (<sm): controles de step abaixo, ocupando 100% com espaçamento */}
                    <div className="flex w-full items-center justify-between gap-2 sm:hidden">
                        <Button
                            aria-label="Anterior"
                            title="Anterior"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(prevStep())}
                            className={cn(
                                'rounded-full p-2 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideStepBack className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Próximo"
                            title="Próximo"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(nextStep())}
                            className={cn(
                                'rounded-full p-2 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideStepForward className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Reset"
                            title="Reset"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(goToStep(0))}
                            className={cn(
                                'rounded-full p-2 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideRotateCcw className="h-5 w-5" />
                        </Button>
                        <Button
                            aria-label="Ir pro fim"
                            title="Ir pro fim"
                            disabled={!hasSimulation}
                            onClick={() => dispatch(goToEnd())}
                            className={cn(
                                'rounded-full p-2 text-text-primary/90 transition-colors hover:bg-bg-block-hover',
                                'disabled:cursor-not-allowed disabled:opacity-30',
                            )}
                        >
                            <LucideFastForward className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Linha 2 (mobile): slider embaixo. md+: continua no mesmo row. */}
                    <div className="flex w-full items-center gap-3 md:w-auto">
                        <div className="hidden h-6 w-px bg-border-subtle/60 md:block" />

                        <div className="flex w-full min-w-0 flex-1 items-center gap-2 md:min-w-[200px]">
                            <span className="shrink-0 text-[10px] text-text-primary">Veloc.</span>
                            <Slider.Root
                                min={0}
                                max={100}
                                step={5}
                                value={[transferSliderValue]}
                                onValueChange={(value) => {
                                    const v = Array.isArray(value) ? value[0] : value
                                    dispatch(setTransferAnimSpeed(v))
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

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-primary">Loop</span>
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

                        {/* Botão FECHAR no fim (direita) — só no mobile */}
                        <div className="ml-auto md:hidden">
                            <Button
                                type="button"
                                aria-label="Fechar controles"
                                title="Fechar"
                                onClick={() => setIsMoreOpen(false)}
                                className="rounded-full p-2 text-text-primary/80 transition-colors hover:bg-bg-block-hover"
                            >
                                <LucideX className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
