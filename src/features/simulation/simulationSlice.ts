import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { SimulationStep } from '../../domain/simulation/types'
import type { BlockType } from '../../domain/blocks/types'

export type SimulationStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished'

export type BlockBuilted = {
    instanceId: string
    blockId: string
    definition: {
        id: BlockType
        title: string
        type: BlockType
    }
}

export type SimulationState = {
    steps: SimulationStep[]
    currentStepIndex: number
    status: SimulationStatus
    playback: {
        autoplay: boolean
    }
    ui: {
        // Duração da animação de deslocamento entre zonas (ms)
        transferAnimMs: number
    }
    builtHash: string | null
    builtBlocks: BlockBuilted[]
}

const initialState: SimulationState = {
    steps: [],
    currentStepIndex: 0,
    status: 'idle',
    playback: {
        autoplay: false,
    },
    ui: {
        // default: mais lento permitido (para ficar bem visível)
        transferAnimMs: 2000,
    },
    builtHash: null,
    builtBlocks: [],
}

const simulationSlice = createSlice({
    name: 'simulation',
    initialState,
    reducers: {
        setSteps(
            state,
            action: PayloadAction<{
                steps: SimulationStep[]
                blockHash: string
                blocks: SimulationState['builtBlocks']
            }>,
        ) {
            state.steps = action.payload.steps
            state.currentStepIndex = 0
            state.status = state.steps.length ? 'ready' : 'idle'
            state.builtHash = action.payload.blockHash
            state.builtBlocks = action.payload.blocks
        },
        resetSimulation() {
            return initialState
        },
        goToStep(state, action: PayloadAction<number>) {
            if (state.steps.length === 0) {
                state.currentStepIndex = 0
                state.status = 'idle'
                return
            }

            const index = action.payload
            const clampedIndex = Math.min(Math.max(index, 0), state.steps.length - 1)
            state.currentStepIndex = clampedIndex

            if (clampedIndex === state.steps.length - 1) {
                state.status = 'finished'
            } else if (state.status === 'finished') {
                state.status = 'ready'
            }
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
        nextStep(state) {
            if (!state.steps.length) return

            if (state.currentStepIndex >= state.steps.length - 1) {
                state.currentStepIndex = state.steps.length - 1
                return
            }
            state.currentStepIndex += 1
        },
        prevStep(state) {
            if (state.currentStepIndex <= 0) {
                state.currentStepIndex = 0

                if (state.status === 'finished') {
                    state.status = 'ready'
                }
                return
            }
            state.currentStepIndex -= 1

            if (state.status === 'finished') {
                state.status = 'ready'
            }
        },
        goToEnd(state) {
            if (!state.steps.length) return
            state.currentStepIndex = state.steps.length - 1
            state.status = 'finished'
        },
        play(state) {
            if (!state.steps.length) return
            state.status = 'running'
        },
        pause(state) {
            state.status = 'paused'
        },
        setTransferAnimMs(state, action: PayloadAction<number>) {
            const ms = action.payload
            const clamped = Math.min(Math.max(ms, 150), 2000)
            state.ui.transferAnimMs = clamped
        },
    },
})

export const {
    setSteps,
    resetSimulation,
    goToStep,
    setStatus,
    setPlayback,
    goToEnd,
    nextStep,
    pause,
    play,
    prevStep,
    setTransferAnimMs,
} = simulationSlice.actions
export const simulationReducer = simulationSlice.reducer
