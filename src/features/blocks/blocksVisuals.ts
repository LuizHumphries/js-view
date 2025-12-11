import {
    LucideBox,
    LucideHourglass,
    LucideLayers,
    LucideOctagonPause,
    LucideSquareChevronRight,
} from 'lucide-react'
import type { BlockType } from '../../domain/blocks/types'

type BlockVisual = {
    icon: React.ComponentType<{ className?: string }>
    accentBgClass: string
    borderGradientClass: string
    glowShadowClass: string
}

const BLOCK_VISUALS: Record<BlockType, BlockVisual> = {
    console: {
        icon: LucideSquareChevronRight,
        accentBgClass: 'bg-accent-console',
        borderGradientClass: 'bg-gradient-to-r from-accent-console/70 to-accent-console/40',
        glowShadowClass: 'shadow-glow-console',
    },
    forLoop: {
        icon: LucideLayers,
        accentBgClass: 'bg-accent-forLoop',
        borderGradientClass: 'bg-gradient-to-r from-accent-forLoop/70 to-accent-forLoop/40',
        glowShadowClass: 'shadow-glow-forLoop',
    },
    timeout: {
        icon: LucideHourglass,
        accentBgClass: 'bg-accent-timeout',
        borderGradientClass: 'bg-gradient-to-r from-accent-timeout/70 to-accent-timeout/40',
        glowShadowClass: 'shadow-glow-timeout',
    },
    promiseThen: {
        icon: LucideBox,
        accentBgClass: 'bg-accent-promiseThen',
        borderGradientClass: 'bg-gradient-to-r from-accent-promiseThen/70 to-accent-promiseThen/40',
        glowShadowClass: 'shadow-glow-promiseThen',
    },
    asyncAwait: {
        icon: LucideOctagonPause,
        accentBgClass: 'bg-accent-asyncAwait',
        borderGradientClass: 'bg-gradient-to-r from-accent-asyncAwait/70 to-accent-asyncAwait/40',
        glowShadowClass: 'shadow-glow-asyncAwait',
    },
}

export function getBlockVisual(type: BlockType): BlockVisual {
    return BLOCK_VISUALS[type]
}
