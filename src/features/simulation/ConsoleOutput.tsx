import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useEffect, useRef } from 'react'
import { cn } from '../../utils/cn'

type ConsoleOutputProps = {
    lines: string[]
    previousLineCount: number
    isSimulationComplete?: boolean
}

export default function ConsoleOutput({
    lines,
    previousLineCount,
    isSimulationComplete = false,
}: ConsoleOutputProps) {
    const currentLineIndex = lines.length - 1
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new lines are added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [lines.length])

    const displayLines = useMemo(() => {
        if (lines.length === 0) {
            return [{ text: 'Nenhum log ainda.', isPlaceholder: true, index: -1 }]
        }
        return lines.map((text, index) => ({ text, isPlaceholder: false, index }))
    }, [lines])

    return (
        <div ref={scrollRef} className="program-scroll flex-1 overflow-y-auto text-xs">
            <AnimatePresence mode="sync">
                {displayLines.map((line) => {
                    // Only highlight current line if simulation is NOT complete
                    const isCurrentLine =
                        !line.isPlaceholder &&
                        line.index === currentLineIndex &&
                        !isSimulationComplete
                    const isNewLine = !line.isPlaceholder && line.index >= previousLineCount

                    return (
                        <motion.div
                            key={line.isPlaceholder ? 'placeholder' : `line-${line.index}`}
                            layout
                            initial={isNewLine ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                layout: { type: 'tween', duration: 0.3, ease: 'easeOut' },
                                opacity: { duration: 0.3, ease: 'easeOut' },
                            }}
                            className={cn(
                                'rounded px-1 py-0.5 transition-all duration-300',
                                line.isPlaceholder
                                    ? 'text-slate-500 italic'
                                    : isCurrentLine
                                      ? 'bg-accent-console/15 font-medium text-accent-console'
                                      : 'whitespace-pre-wrap text-slate-400',
                            )}
                        >
                            {!line.isPlaceholder && (
                                <span
                                    className={cn(
                                        'mr-2 select-none',
                                        isCurrentLine ? 'text-accent-console/70' : 'text-slate-600',
                                    )}
                                >
                                    {`${line.index + 1}:`}
                                </span>
                            )}
                            {line.text}
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
