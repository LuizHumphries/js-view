import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit'
import type { ProgramBlockInstance } from '../../domain/program/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { BlockDefinition, BlockType } from '../../domain/blocks/types'
import { selectBlockDefinitions } from '../blocks/blocksSlice'
import type { RootState } from '../../store'

export type ProgramState = {
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
        removeProgramBlock(state, action: PayloadAction<string>) {
            const instanceId = action.payload
            state.blocks = state.blocks.filter((item) => item.instanceId !== instanceId)
        },
    },
})

export const { addProgramBlock, removeProgramBlock } = programSlice.actions
export const programReducer = programSlice.reducer

export const selectProgramBlocks = (state: RootState) => state.program.blocks

export const selectProgramBlocksWithDefinitions = createSelector(
    [selectProgramBlocks, selectBlockDefinitions],
    (instances, definitions) =>
        instances
            .map((inst) => {
                const definition = definitions.find((definition) => definition.id === inst.blockId)
                if (!definition) return null
                return { instanceId: inst.instanceId, blockId: inst.blockId, definition }
            })
            .filter(
                (x): x is { instanceId: string; blockId: BlockType; definition: BlockDefinition } =>
                    x !== null,
            ),
)
