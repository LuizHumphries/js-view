import { LucideArrowDown } from 'lucide-react'
import { buildSimulation } from '../../domain/simulation/buildSimulation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectProgramBlocks, selectProgramBlocksWithDefinitions } from '../program/programSlice'
import { setSteps } from './simulationSlice'
import { cn } from '../../utils/cn'
import { Fragment } from 'react/jsx-runtime'
import { Button } from '@base-ui-components/react'

type BuildSimulationButtonProps = {
    currentBlockHash: string
    isStale: boolean
    onBuilt?: () => void
    onEmpty?: () => void
    onError?: (message: string) => void
}

export default function BuildSimulationButton({
    currentBlockHash,
    isStale,
    onBuilt,
    onEmpty,
    onError,
}: BuildSimulationButtonProps) {
    const dispatch = useAppDispatch()
    const blocks = useAppSelector(selectProgramBlocks)
    const blocksWithDefs = useAppSelector(selectProgramBlocksWithDefinitions)

    const handleBuild = () => {
        if (blocks.length === 0) {
            onEmpty?.()
            return
        }

        try {
            const steps = buildSimulation(blocks)

            const builtBlocks = blocksWithDefs.map((b) => ({
                instanceId: b.instanceId,
                blockId: b.blockId,
                definition: {
                    id: b.definition.id,
                    title: b.definition.title,
                    type: b.definition.type,
                },
            }))
            dispatch(setSteps({ steps, blockHash: currentBlockHash, blocks: builtBlocks }))
            onBuilt?.()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Falha ao gerar a simulação.'
            onError?.(message)
        }
    }

    return (
        <Button
            type="button"
            onClick={handleBuild}
            className={cn(
                'relative overflow-hidden rounded-lg px-4 py-1 text-xs font-bold tracking-wide uppercase',
                'transition-all duration-300 ease-out',
                isStale
                    ? [
                          'animate-breathe',
                          'bg-(--gradient-cta) text-text-primary',
                          'shadow-glow-warning hover:brightness-110 active:scale-95',
                      ].join(' ')
                    : 'bg-bg-block-hover text-text-muted/70 hover:bg-bg-block-strong hover:text-text-muted',
            )}
        >
            {isStale && <span className={cn('absolute inset-0', 'animate-gold-shimmer')} />}
            <span className="relative z-10 flex items-center gap-1.5">
                {isStale ? (
                    <Fragment>
                        Gerar
                        <LucideArrowDown className="h-4 w-4" />
                    </Fragment>
                ) : (
                    <Fragment>
                        Regerar
                        <LucideArrowDown className="h-4 w-4" />
                    </Fragment>
                )}
            </span>
        </Button>
    )
}
