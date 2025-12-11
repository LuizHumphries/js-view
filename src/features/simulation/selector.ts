import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { selectProgramBlocks } from '../program/programSlice'
import type { ProgramBlockInstance } from '../../domain/program/types'

export const selectSimulationState = (state: RootState) => state.simulation

export const selectCurrentSimulationStep = (state: RootState) => {
    const { steps, currentStepIndex } = state.simulation
    if (!steps.length) return null
    return steps[Math.min(currentStepIndex, steps.length - 1)]
}

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
