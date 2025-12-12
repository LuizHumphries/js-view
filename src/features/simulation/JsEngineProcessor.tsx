import type { SimulationTask } from '../../domain/simulation/types'
import { cn } from '../../utils/cn'
import TaskCard from './TaskCard'

type JsEngineProcessorProps = {
    currentTask: SimulationTask | null
}

export default function JsEngineProcessor({ currentTask }: JsEngineProcessorProps) {
    const isProcessing = currentTask !== null

    return (
        <div
            className={cn(
                'relative flex min-h-[80px] flex-col items-center justify-center gap-2',
                'rounded-xl border border-slate-700 bg-bg-panel px-4 py-3',
            )}
        >
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        'h-2 w-2 rounded-full',
                        isProcessing ? 'animate-pulse bg-accent-success' : 'bg-slate-600',
                    )}
                />
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                    JS Engine
                </span>
            </div>

            {currentTask ? (
                <TaskCard task={currentTask} isWaiting={false} />
            ) : (
                <span className="text-xs text-slate-500 italic opacity-50">Aguardando...</span>
            )}
        </div>
    )
}
