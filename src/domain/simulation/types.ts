import type { BlockType } from '../blocks/types'

export type SimulationTaskKind = 'sync' | 'microCallback' | 'macroCallback' | 'promiseResolve'

export type SimulationTask = {
    id: string
    label: string
    source: BlockType
    blockInstanceId: string
    kind: SimulationTaskKind
    delayMs?: number
    remainingMs?: number
}

export type SimulationStep = {
    id: string
    callStack: SimulationTask[]
    microTaskQueue: SimulationTask[]
    macroTaskQueue: SimulationTask[]
    webApis: SimulationTask[]
    consoleOutput: string[]
    description: string
    currentlyProcessing: SimulationTask | null
    jsEngineTask: SimulationTask | null
    sourceOpIndex: number
    activeBlockInstanceId: string | null
    waitingBlockInstanceIds: string[]
}
