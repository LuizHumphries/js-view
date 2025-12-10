import { Button } from '@base-ui-components/react'
import type { BlockDefinition } from '../../domain/blocks/types'
import { getBlockVisual } from '../../features/blocks/blocksVisuals'
import { cn } from '../../utils/cn'

type BlockProps = {
    definition: BlockDefinition
    hasIconBg?: boolean
    hasCodeDefinition?: boolean
    onClick?: () => void
}

export default function Block({
    definition,
    onClick,
    hasIconBg = true,
    hasCodeDefinition = true,
}: BlockProps) {
    const visual = getBlockVisual(definition.type)
    const Icon = visual.icon

    return (
        <div
            className={cn(
                'w-full rounded-xl p-px',
                visual.borderGradientClass,
                visual.glowShadowClass,
            )}
        >
            <Button
                onClick={onClick}
                className={cn(
                    'flex w-full cursor-pointer flex-col items-start gap-2 overflow-hidden p-2',
                )}
            >
                <div className="flex flex-row items-center gap-2">
                    <div
                        className={cn(
                            hasIconBg && 'rounded-xl p-2',
                            hasIconBg && visual.accentBgClass,
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-white">{definition.title}</span>
                </div>
                {hasCodeDefinition && (
                    <code
                        className={cn(
                            'font-mono text-xs text-text-muted opacity-80',
                            'rounded-md bg-bg-block-hover px-2 py-1',
                            'overflow-hidden text-ellipsis whitespace-normal',
                            'items-start text-start',
                        )}
                    >
                        {definition.description}
                    </code>
                )}
            </Button>
        </div>
    )
}
