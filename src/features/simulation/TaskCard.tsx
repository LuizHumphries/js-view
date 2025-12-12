import { motion } from 'framer-motion'
import type { SimulationTask } from '../../domain/simulation/types'
import { cn } from '../../utils/cn'
import { getTaskBorderClasses } from './simulationVisuals'
import { useState } from 'react'

type TaskCardProps = {
    task: SimulationTask
    isWaiting?: boolean
    zoneId?: string
    isHidden?: boolean
    exitAnimation?: 'none' | 'final'
}

function WaitingSpinner() {
    return (
        <motion.div
            className="h-4 w-4 shrink-0 rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    )
}

function getTaskSubtitle(task: SimulationTask): string | null {
    if (task.kind === 'promiseResolve') {
        return 'Promise.resolve'
    }
    if (task.kind === 'microCallback' && task.source === 'promiseThen') {
        return 'Microtask – callback do .then'
    }
    if (task.kind === 'microCallback' && task.source === 'asyncAwait') {
        return 'Microtask – continuação do await'
    }
    if (task.kind === 'macroCallback' && task.source === 'timeout') {
        if (task.remainingMs !== undefined && task.remainingMs > 0) {
            return `setTimeout – ${task.remainingMs}ms restantes`
        }
        return `setTimeout callback (${task.delayMs}ms)`
    }
    return null
}

export default function TaskCard({
    task,
    isWaiting = false,
    zoneId,
    isHidden = false,
    exitAnimation = 'none',
}: TaskCardProps) {
    const subtitle = getTaskSubtitle(task)
    const isTimer = task.kind === 'macroCallback' && task.source === 'timeout'
    const hasTimeRemaining = task.remainingMs !== undefined && task.remainingMs > 0
    const [isLayoutAnimating, setIsLayoutAnimating] = useState(false)

    return (
        <motion.div
            layout
            transition={{
                layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
            exit={
                exitAnimation === 'final'
                    ? {
                          opacity: 0,
                          x: [0, -6, 6, -6, 6, 0],
                          rotate: [0, -2, 2, -2, 2, 0],
                          filter: ['none', 'grayscale(1)'],
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          borderColor: 'rgba(148, 163, 184, 0)',
                          transition: { duration: 0.55, ease: 'easeOut' },
                      }
                    : undefined
            }
            onLayoutAnimationStart={() => setIsLayoutAnimating(true)}
            onLayoutAnimationComplete={() => setIsLayoutAnimating(false)}
            style={{ zIndex: isLayoutAnimating ? 50 : 'auto' }}
            data-sim-task-id={task.id}
            data-sim-zone={zoneId}
            className={cn(
                'rounded-xl border px-2 py-1.5 text-[11px] sm:px-3 sm:py-2 sm:text-xs',
                'flex items-center gap-2',
                'bg-bg-block-strong text-text-primary',
                isWaiting && 'opacity-50',
                isHidden && 'invisible',
                getTaskBorderClasses(task.source),
            )}
        >
            {isWaiting && <WaitingSpinner />}

            <div className="flex flex-col">
                <span className={cn('leading-snug', isWaiting && 'text-text-muted')}>
                    {task.label}
                </span>

                {subtitle && (
                    <span
                        className={cn(
                            'mt-0.5 text-[8px] font-medium tracking-wide uppercase sm:text-[9px]',
                            isTimer && hasTimeRemaining ? 'text-amber-400' : 'text-slate-400',
                        )}
                    >
                        {subtitle}
                    </span>
                )}
            </div>
        </motion.div>
    )
}
