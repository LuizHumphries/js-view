import { motion } from 'framer-motion'
import type { SimulationTask } from '../../domain/simulation/types'
import { cn } from '../../utils/cn'
import { getTaskBorderClasses } from './simulationVisuals'

type TaskCardProps = {
    task: SimulationTask
    isWaiting?: boolean
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
        return 'Microtask – .then callback'
    }
    if (task.kind === 'microCallback' && task.source === 'asyncAwait') {
        return 'Microtask – await continuation'
    }
    if (task.kind === 'macroCallback' && task.source === 'timeout') {
        if (task.remainingMs !== undefined && task.remainingMs > 0) {
            return `setTimeout – ${task.remainingMs}ms restantes`
        }
        return `setTimeout callback (${task.delayMs}ms)`
    }
    return null
}

export default function TaskCard({ task, isWaiting = false }: TaskCardProps) {
    const subtitle = getTaskSubtitle(task)
    const isTimer = task.kind === 'macroCallback' && task.source === 'timeout'
    const hasTimeRemaining = task.remainingMs !== undefined && task.remainingMs > 0

    return (
        <motion.div
            layout="position"
            layoutId={task.id}
            transition={{
                layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
            style={{ zIndex: 99999 }}
            className={cn(
                'rounded-xl border px-3 py-2 text-xs',
                'flex items-center gap-2',
                'bg-bg-block-strong text-text-primary',
                isWaiting && 'opacity-50',
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
                            'mt-0.5 text-[9px] font-medium tracking-wide uppercase',
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
