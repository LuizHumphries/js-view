import type { BlockType } from '../../domain/blocks/types'
import { cn } from '../../utils/cn'
import { Check, Play, Hourglass, Circle } from 'lucide-react'
import type { ReactNode } from 'react'

export type TimelineState = 'pending' | 'active' | 'waiting' | 'completed'


export function getTaskBorderClasses(source: BlockType): string {
    return cn(
        source === 'console' && 'border-accent-console shadow-glow-console',
        source === 'forLoop' && 'border-accent-forLoop shadow-glow-forLoop',
        source === 'timeout' && 'border-accent-timeout shadow-glow-timeout',
        source === 'asyncAwait' && 'border-accent-asyncAwait shadow-glow-asyncAwait',
        source === 'promiseThen' && 'border-accent-promiseThen shadow-glow-promiseThen',
        !['console', 'forLoop', 'timeout', 'asyncAwait', 'promiseThen'].includes(source) &&
        'border-border-subtle',
    )
}


export function getBlockBorderClass(type: BlockType): string {
    return cn(
        type === 'console' && 'border-accent-console',
        type === 'forLoop' && 'border-accent-forLoop',
        type === 'timeout' && 'border-accent-timeout',
        type === 'asyncAwait' && 'border-accent-asyncAwait',
        type === 'promiseThen' && 'border-accent-promiseThen',
        !['console', 'forLoop', 'timeout', 'asyncAwait', 'promiseThen'].includes(type) &&
        'border-border-subtle',
    )
}


export function getBlockGlowClass(type: BlockType): string {
    return cn(
        type === 'console' && 'shadow-glow-console',
        type === 'forLoop' && 'shadow-glow-forLoop',
        type === 'timeout' && 'shadow-glow-timeout',
        type === 'asyncAwait' && 'shadow-glow-asyncAwait',
        type === 'promiseThen' && 'shadow-glow-promiseThen',
    )
}


export function getTimelineBlockClasses(type: BlockType, state: TimelineState): string {
    if (state === 'completed') {
        return cn('border-slate-700', 'opacity-50', 'border-opacity-40')
    }

    if (state === 'pending') {
        const border = getBlockBorderClass(type)
        // Blocos que ainda não começaram ficam levemente "dimmer"
        return cn(border, 'opacity-70', 'border-opacity-40')
    }

    if (state === 'waiting') {
        const border = getBlockBorderClass(type)
        return cn(border, 'opacity-60', 'border-opacity-50')
    }

    const border = getBlockBorderClass(type)
    const glow = state === 'active' ? getBlockGlowClass(type) : ''

    return cn(border, glow)
}


export function getEngineContainerClasses(source: BlockType | undefined): string {
    if (!source) {
        return 'border-slate-700'
    }
    return getTaskBorderClasses(source)
}


export function getTimelineStateTextClass(state: TimelineState): string {
    return cn(
        state === 'completed' && 'text-accent-success',
        state === 'active' && 'text-accent-gold',
        state === 'waiting' && 'text-amber-500',
        state === 'pending' && 'text-slate-500',
    )
}


export function getTimelineStateIcon(state: TimelineState): ReactNode {
    const iconClass = 'h-3 w-3'
    switch (state) {
        case 'completed':
            return <Check className={iconClass} />
        case 'active':
            return <Play className={iconClass} />
        case 'waiting':
            return <Hourglass className={iconClass} />
        case 'pending':
            return <Circle className={iconClass} />
    }
}
