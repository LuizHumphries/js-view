import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { SimulationStep } from '../../domain/simulation/types'

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'finished'

export type SimulationState = {
    steps: SimulationStep[]
    currentStepIndex: number
    status: SimulationStatus
    playback: {
        autoplay: boolean
        speedMs: number
    }
}

const initialState: SimulationState = {
    steps: [],
    currentStepIndex: 0,
    status: 'idle',
    playback: {
        autoplay: false,
        speedMs: 1000,
    },
}

const simulationSlice = createSlice({
    name: 'simulation',
    initialState,
    reducers: {
        setSteps(state, action: PayloadAction<SimulationStep[]>) {
            state.steps = action.payload
            state.currentStepIndex = 0
            state.status = 'idle'
        },
        resetSimulation() {
            return initialState
        },

        goToStep(state, action: PayloadAction<number>) {
            const index = action.payload

            if (state.steps.length === 0) {
                state.currentStepIndex = 0
                return
            }

            const clampedIndex = Math.min(Math.max(index, 0), state.steps.length - 1)

            state.currentStepIndex = clampedIndex
        },

        setStatus(state, action: PayloadAction<SimulationStatus>) {
            state.status = action.payload
        },
        setPlayback(state, action: PayloadAction<Partial<SimulationState['playback']>>) {
            state.playback = {
                ...state.playback,
                ...action.payload,
            }
        },
    },
})

export const { setSteps, resetSimulation, goToStep, setStatus, setPlayback } =
    simulationSlice.actions
export const simulationReducer = simulationSlice.reducer
