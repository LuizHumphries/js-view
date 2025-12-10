export type SimulationStep = {
    id: string
    callStack: string[]
    microTaskQueue: string[]
    macroTaskQueue: string[]
    webApis: string[]
    consoleOutput: string[]
    description: string
}
