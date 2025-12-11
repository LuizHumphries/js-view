import { LucideArrowDown } from 'lucide-react'
import { buildSimulation } from '../../domain/simulation/buildSimulation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectProgramBlocks } from '../program/programSlice'
import { setSteps } from './simulationSlice'
import { cn } from '../../utils/cn'
import { Fragment } from 'react/jsx-runtime'

type BuildSimulationButtonProps = {
    currentBlockHash: string
    isStale: boolean
}

export default function BuildSimulationButton({
    currentBlockHash,
    isStale,
}: BuildSimulationButtonProps) {
    const dispatch = useAppDispatch()
    const blocks = useAppSelector(selectProgramBlocks)

    const handleBuild = () => {
        const steps = buildSimulation(blocks)
        dispatch(setSteps({ steps, blockHash: currentBlockHash }))
    }

    return (
        <button
            onClick={handleBuild}
            className={cn(
                'relative overflow-hidden rounded-lg px-4 py-1 text-xs font-bold tracking-wide uppercase',
                'transition-all duration-300 ease-out',
                isStale
                    ? 'animate-pulse-subtle bg-linear-to-r from-accent-console to-accent-asyncAwait text-white shadow-lg shadow-accent-promiseThen/40 hover:scale-105 hover:shadow-xl hover:shadow-accent-console/50 active:scale-95'
                    : 'bg-bg-block-hover text-text-muted/60 hover:bg-bg-block-strong hover:text-text-muted',
            )}
        >
            {isStale && (
                <span
                    className={cn(
                        'absolute inset-0',
                        'bg-linear-to-r from-transparent via-white/20 to-transparent',
                        'animate-shimer -translate-x-full',
                    )}
                />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
                {isStale ? (
                    <Fragment>
                        Build
                        <LucideArrowDown className="h-4 w-4" />
                    </Fragment>
                ) : (
                    <Fragment>
                        Rebuild
                        <LucideArrowDown className="h-4 w-4" />
                    </Fragment>
                )}
            </span>
        </button>
    )
}
