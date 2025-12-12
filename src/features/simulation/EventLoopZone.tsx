import { motion } from 'framer-motion'
import type { SimulationStatus } from './simulationSlice'
import type { SimulationTask } from '../../domain/simulation/types'
import TaskCard from './TaskCard'

type EventLoopZoneProps = {
    status: SimulationStatus
    hasBuilt: boolean
    transitTask: SimulationTask | null
}

export default function EventLoopZone({ status, hasBuilt, transitTask }: EventLoopZoneProps) {
    const isAnimating = hasBuilt && status === 'running'

    return (
        <div className="flex w-44 flex-col items-start rounded-3xl border border-accent-gold/30 bg-accent-gold/5 p-4">
            <div className="relative mb-3 flex h-20 w-20 items-center justify-center self-center">
                <motion.svg
                    className="absolute h-full w-full text-accent-gold-muted"
                    viewBox="0 0 35 35"
                    fill="currentColor"
                    animate={isAnimating ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                        isAnimating
                            ? { duration: 2, repeat: Infinity, ease: 'linear' }
                            : { duration: 0 }
                    }
                >
                    <path d="M1.6,16.5a1.3,1.3,0,0,1-.2-.015,1.251,1.251,0,0,1-1.04-1.43,17.277,17.277,0,0,1,33-4.014,1.25,1.25,0,1,1-2.3.969A14.777,14.777,0,0,0,2.833,15.441,1.25,1.25,0,0,1,1.6,16.5Z" />
                    <path d="M33.426,13.43h-.01L23.6,13.355a1.25,1.25,0,0,1,.01-2.5h.01l8.568.065.065-8.568A1.25,1.25,0,0,1,33.5,1.111h.009a1.251,1.251,0,0,1,1.241,1.26l-.074,9.818a1.251,1.251,0,0,1-1.25,1.241Z" />
                    <path d="M17.569,34.557A17.315,17.315,0,0,1,1.64,23.963a1.25,1.25,0,1,1,2.3-.969,14.777,14.777,0,0,0,28.222-3.435,1.25,1.25,0,0,1,2.47.39A17.314,17.314,0,0,1,17.569,34.557Z" />
                    <path d="M1.5,33.889H1.491A1.25,1.25,0,0,1,.25,32.629l.075-9.818A1.251,1.251,0,0,1,1.584,21.57l9.819.076a1.25,1.25,0,0,1-.01,2.5h-.01L2.815,24.08,2.75,32.648A1.251,1.251,0,0,1,1.5,33.889Z" />
                </motion.svg>

                <span className="z-10 text-[9px] font-bold tracking-wider text-accent-gold uppercase">
                    Event Loop
                </span>
            </div>

            <div className="flex w-full flex-1 flex-col items-center justify-start">
                {transitTask && (
                    <TaskCard key={transitTask.id} task={transitTask} isWaiting={false} />
                )}
            </div>
        </div>
    )
}
