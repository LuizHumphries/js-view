import { sequenceToLabel } from './codegen'
import type { ProgramBlockInstance } from './types'

export function getConsoleMessagesForBlock(instance: ProgramBlockInstance): string[] {
    const label = sequenceToLabel(instance.sequence)

    switch (instance.blockId) {
        case 'console':
            return [label]
        case 'forLoop':
            return [`For Loop: ${label} - 0`, `For Loop: ${label} - 1`]
        case 'promiseThen':
            return [`Promise ${label}`]
        case 'timeout':
            return [`setTimeout ${label}`]
        case 'asyncAwait':
            return [`PRE await ${label}`, `POST await ${label}`]
        default:
            return []
    }
}
