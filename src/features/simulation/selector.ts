import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { selectProgramBlocks } from '../program/programSlice'
import type { ProgramBlockInstance } from '../../domain/program/types'
import type { TimelineState } from './simulationVisuals'

export const selectSimulationState = (state: RootState) => state.simulation

export const selectCurrentSimulationStep = (state: RootState) => {
    const { steps, currentStepIndex } = state.simulation
    if (!steps.length) return null
    return steps[Math.min(currentStepIndex, steps.length - 1)]
}

export const selectHasBuiltSimulation = (state: RootState) => state.simulation.steps.length > 0

function hashBlocks(blocks: ProgramBlockInstance[]): string {
    return JSON.stringify(blocks.map((b) => ({ blockId: b.blockId, instanceId: b.instanceId })))
}

export const selectIsSimulationStale = createSelector(
    [selectSimulationState, selectProgramBlocks],
    (simulation, programBlocks) => {
        const currentHash = hashBlocks(programBlocks)

        if (simulation.builtHash === null) return true
        return simulation.builtHash !== currentHash
    },
)

export const selectCurrentBlockHash = createSelector([selectProgramBlocks], (programBlocks) =>
    hashBlocks(programBlocks),
)

export const selectBlocksWithTimelineState = createSelector(
    [selectSimulationState],
    (simulation) => {
        const { currentStepIndex, steps, builtBlocks } = simulation

        if (steps.length === 0) return []
        if (builtBlocks.length === 0) return []

        const currentStep = steps[currentStepIndex] ?? steps[steps.length - 1]
        const isFinished = currentStepIndex >= steps.length - 1

        // Use the step's tracking of active and waiting blocks
        const activeBlockId = currentStep.activeBlockInstanceId
        const waitingBlockIds = new Set(currentStep.waitingBlockInstanceIds)

        // Track which blocks have been fully completed (processed and not waiting)
        const completedBlockIds = new Set<string>()

        // A block is completed if it was processed in previous steps and is not currently waiting
        for (let i = 0; i < currentStepIndex; i++) {
            const step = steps[i]
            if (step.activeBlockInstanceId && !waitingBlockIds.has(step.activeBlockInstanceId)) {
                // Check if this block has any tasks still in queues
                const hasTasksInQueues =
                    currentStep.microTaskQueue.some(
                        (t) => t.blockInstanceId === step.activeBlockInstanceId,
                    ) ||
                    currentStep.macroTaskQueue.some(
                        (t) => t.blockInstanceId === step.activeBlockInstanceId,
                    ) ||
                    currentStep.webApis.some(
                        (t) => t.blockInstanceId === step.activeBlockInstanceId,
                    )

                if (!hasTasksInQueues) {
                    completedBlockIds.add(step.activeBlockInstanceId)
                }
            }
        }

        return builtBlocks.map((builtBlock) => {
            let state: TimelineState

            if (isFinished) {
                state = 'completed'
            } else if (builtBlock.instanceId === activeBlockId) {
                state = 'active'
            } else if (waitingBlockIds.has(builtBlock.instanceId)) {
                state = 'waiting'
            } else if (completedBlockIds.has(builtBlock.instanceId)) {
                state = 'completed'
            } else {
                state = 'pending'
            }

            return {
                instanceId: builtBlock.instanceId,
                definition: builtBlock.definition,
                state,
            }
        })
    },
)
