import { sequenceToLabel } from '../program/sequenceUtils'
import type { ProgramBlockInstance } from '../program/types'
import type { SimulationOp } from './ops'

export function getTimeoutDelayMs(_sequence: number): number {
    void _sequence
    return 1000
}

export function compileBlocksToOps(instances: ProgramBlockInstance[]): SimulationOp[] {
    const ops: SimulationOp[] = []

    for (const instance of instances) {
        const label = sequenceToLabel(instance.sequence)
        const blockInstanceId = instance.instanceId

        switch (instance.blockId) {
            case 'console': {
                ops.push({
                    kind: 'syncLog',
                    message: label,
                    source: 'console',
                    blockInstanceId,
                })
                break
            }

            case 'forLoop': {
                ops.push(
                    {
                        kind: 'syncLog',
                        message: `For Loop: ${label} 0`,
                        source: 'forLoop',
                        blockInstanceId,
                    },
                    {
                        kind: 'syncLog',
                        message: `For Loop: ${label} 1`,
                        source: 'forLoop',
                        blockInstanceId,
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
                        blockInstanceId,
                    },
                    {
                        kind: 'scheduleMicrotask',
                        message: `POST await ${label}`,
                        source: 'asyncAwait',
                        blockInstanceId,
                    },
                )
                break
            }

            case 'promiseThen': {
                ops.push({
                    kind: 'promiseResolve',
                    source: 'promiseThen',
                    blockInstanceId,
                })

                ops.push({
                    kind: 'scheduleMicrotask',
                    message: `Promise ${label}`,
                    source: 'promiseThen',
                    blockInstanceId,
                })
                break
            }

            case 'timeout': {
                const delayMs = getTimeoutDelayMs(instance.sequence)
                ops.push({
                    kind: 'scheduleMacrotask',
                    message: `setTimeout ${label}`,
                    source: 'timeout',
                    blockInstanceId,
                    delayMs,
                })
                break
            }
        }
    }

    return ops
}
