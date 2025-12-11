import { sequenceToLabel } from '../program/codegen'
import type { ProgramBlockInstance } from '../program/types'
import type { SimulationOp } from './ops'

export function compileBlocksToOps(instances: ProgramBlockInstance[]): SimulationOp[] {
    const ops: SimulationOp[] = []

    for (const instance of instances) {
        const label = sequenceToLabel(instance.sequence)

        switch (instance.blockId) {
            case 'console': {
                ops.push({
                    kind: 'syncLog',
                    message: label,
                    source: 'console',
                })
                break
            }

            case 'forLoop': {
                ops.push(
                    {
                        kind: 'syncLog',
                        message: `For Loop: ${label} 1`,
                        source: 'forLoop',
                    },
                    {
                        kind: 'syncLog',
                        message: `For Loop: ${label} 2`,
                        source: 'forLoop',
                    },
                )
                break
            }

            case 'asyncAwait': {
                ops.push(
                    {
                        kind: 'syncLog',
                        message: `PRE await ${label}`,
                        source: 'asyncAwait',
                    },
                    {
                        kind: 'scheduleMicrotask',
                        message: `POST await ${label}`,
                        source: 'asyncAwait',
                    },
                )
                break
            }

            case 'promiseThen': {
                ops.push({
                    kind: 'scheduleMicrotask',
                    message: `Promise ${label}`,
                    source: 'promiseThen',
                })
                break
            }

            case 'timeout': {
                ops.push({
                    kind: 'scheduleMacrotask',
                    message: `setTimeout ${label}`,
                    source: 'timeout',
                })
                break
            }
        }
    }

    return ops
}
