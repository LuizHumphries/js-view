import type { ProgramBlockInstance } from '../program/types'
import type { SimulationStep } from './types'
import { compileBlocksToOps } from './compileBlocksToOps'
import { runOpsToSteps } from './runOpsToSteps'

export function buildSimulation(instances: ProgramBlockInstance[]): SimulationStep[] {
    const ops = compileBlocksToOps(instances)
    return runOpsToSteps(ops)
}
