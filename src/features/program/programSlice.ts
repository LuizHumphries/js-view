import { createSlice, nanoid } from '@reduxjs/toolkit'
import { ProgramBlockInstance } from '../../domain/program/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import { BlockType } from '../../domain/blocks/types'

export interface ProgramState {
    blocks: ProgramBlockInstance[]
}

const initialState: ProgramState = {
    blocks: [],
}

const programSlice = createSlice({
    name: 'program',
    initialState,
    reducers: {
        addProgramBlock: {
            reducer(state, action: PayloadAction<ProgramBlockInstance>) {
                state.blocks.push(action.payload)
            },
            prepare(blockId: BlockType) {
                const payload: ProgramBlockInstance = { instanceId: nanoid(), blockId }
                return { payload }
            },
        },
        removeProgramBlock(state, action: PayloadAction<{ instanceId: string }>) {
            state.blocks = state.blocks.filter(
                (item) => item.instanceId !== action.payload.instanceId,
            )
        },
    },
})

export const { addProgramBlock, removeProgramBlock } = programSlice.actions
export const programReducer = programSlice.reducer
