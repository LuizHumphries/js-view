import { useEffect, useRef } from 'react'
import type { BlockType } from '../../domain/blocks/types'
import { cn } from '../../utils/cn'
import {
    getTimelineBlockClasses,
    getTimelineStateIcon,
    getTimelineStateTextClass,
    type TimelineState,
} from './simulationVisuals'

type BlockWithState = {
    instanceId: string
    definition: {
        id: BlockType
        title: string
        type: BlockType
    }
    state: TimelineState
}

type CodeTimelineProps = {
    blocks: BlockWithState[]
    currentIndex: number
    isRunning?: boolean
}

export default function CodeTimeline({
    blocks,
    currentIndex,
    isRunning = false,
}: CodeTimelineProps) {
    const activeRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({
                behavior: isRunning ? 'auto' : 'smooth',
                block: 'nearest',
                inline: 'nearest',
            })
        }
    }, [currentIndex, isRunning])

    if (blocks.length === 0) {
        return (
            <div className="flex h-full flex-col rounded-xl border border-border-subtle bg-bg-panel p-3">
                <h3 className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    Timeline do Código
                </h3>
                <div className="flex flex-1 items-center justify-center">
                    <span className="text-xs text-slate-500 italic">
                        Pressione Gerar para ver a timeline
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col rounded-xl border border-border-subtle bg-bg-panel">
            <h3 className="shrink-0 p-3 pb-0 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Timeline do Código
            </h3>
            <div className="program-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
                <div className="flex min-h-0 flex-col gap-2">
                    {blocks.map((block, idx) => {
                        const index = idx + 1
                        const isActive = block.state === 'active'
                        const icon = getTimelineStateIcon(block.state)

                        return (
                            <div
                                key={block.instanceId}
                                ref={isActive ? activeRef : null}
                                data-sim-timeline-active={isActive ? 'true' : undefined}
                                className={cn(
                                    'w-full min-w-0',
                                    'flex items-start gap-2 rounded-lg border px-3 py-2',
                                    'bg-bg-block/60 transition-all duration-200',
                                    getTimelineBlockClasses(block.definition.type, block.state),
                                    isActive && 'scale-[1.02]',
                                )}
                            >
                                <span className="w-5 shrink-0 text-right font-mono text-[10px] text-slate-500">
                                    {index}
                                </span>
                                <span
                                    className={cn(
                                        'w-4 text-center text-xs',
                                        getTimelineStateTextClass(block.state),
                                    )}
                                >
                                    {icon}
                                </span>
                                <span
                                    className={cn(
                                        'min-w-0 flex-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap',
                                        block.state === 'completed'
                                            ? 'text-slate-500 line-through'
                                            : 'text-text-primary',
                                    )}
                                >
                                    {block.definition.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
