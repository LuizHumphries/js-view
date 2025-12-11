import type { BlockType } from '../blocks/types'

export type SimulationOp =
    | {
          kind: 'syncLog'
          message: string
          source: BlockType
      }
    | {
          kind: 'scheduleMicrotask'
          message: string
          source: BlockType
      }
    | {
          kind: 'scheduleMacrotask'
          message: string
          source: BlockType
      }
