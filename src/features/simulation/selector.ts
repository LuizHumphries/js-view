import type { RootState } from '../../store'

export const selectSimulationState = (state: RootState) => state.simulation

export const selectCurrentSimulationStep = (state: RootState) => {
    const { steps, currentStepIndex } = state.simulation
    if (!steps.length) return null
    return steps[Math.min(currentStepIndex, steps.length - 1)]
}
