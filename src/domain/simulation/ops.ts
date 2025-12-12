import type { BlockType } from '../blocks/types'

export type SimulationOp =
    | {
          kind: 'syncLog'
          message: string
          source: BlockType
          blockInstanceId: string
      }
    | {
          kind: 'scheduleMicrotask'
          message: string
          source: BlockType
          blockInstanceId: string
      }
    | {
          kind: 'scheduleMacrotask'
          message: string
          source: BlockType
          blockInstanceId: string
          delayMs: number
      }
    | {
          kind: 'promiseResolve'
          source: BlockType
          blockInstanceId: string
      }
