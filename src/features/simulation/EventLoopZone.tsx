import { motion } from 'framer-motion'
import type { SimulationStatus } from './simulationSlice'
import type { SimulationTask } from '../../domain/simulation/types'
import TaskCard from './TaskCard'
import { LucideRefreshCw } from 'lucide-react'

type EventLoopZoneProps = {
    status: SimulationStatus
    hasBuilt: boolean
    transitTask: SimulationTask | null
    isHidden?: boolean
}

export default function EventLoopZone({
    status,
    hasBuilt,
    transitTask,
    isHidden = false,
}: EventLoopZoneProps) {
    const isAnimating = hasBuilt && status === 'running'

    return (
        <div className="flex w-full min-w-0 flex-col items-start rounded-3xl border border-accent-gold/25 bg-linear-to-b from-accent-gold/10 to-transparent p-3 sm:p-4">
            <div className="mb-3 flex w-full items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-accent-gold/15 text-accent-gold sm:h-10 sm:w-10">
                    <motion.div
                        animate={isAnimating ? { rotate: 360 } : { rotate: 0 }}
                        transition={
                            isAnimating
                                ? { duration: 1.8, repeat: Infinity, ease: 'linear' }
                                : { duration: 0 }
                        }
                    >
                        <LucideRefreshCw className="h-5 w-5" />
                    </motion.div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-semibold tracking-[0.14em] text-accent-gold uppercase">
                        Event Loop
                    </span>
                    <span className="text-xs text-text-muted">Coordena filas e execução</span>
                </div>
            </div>

            <div className="flex w-full flex-1 flex-col items-center justify-start">
                {transitTask && (
                    <TaskCard
                        key={transitTask.id}
                        task={transitTask}
                        isWaiting={false}
                        zoneId="eventloop"
                        isHidden={isHidden}
                    />
                )}
            </div>
        </div>
    )
}
