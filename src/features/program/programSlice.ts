import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit'
import type { ProgramBlockInstance } from '../../domain/program/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { BlockDefinition, BlockType } from '../../domain/blocks/types'
import { selectBlockDefinitions } from '../blocks/blocksSlice'
import type { RootState } from '../../store'

export type ProgramState = {
    blocks: ProgramBlockInstance[]
    nextSequence: number
}

const initialState: ProgramState = {
    blocks: [],
    nextSequence: 0,
}

const programSlice = createSlice({
    name: 'program',
    initialState,
    reducers: {
        addProgramBlock(state, action: PayloadAction<BlockType>) {
            const blockId = action.payload

            if (state.blocks.length === 0) {
                state.nextSequence = 0
            }

            const newInstance: ProgramBlockInstance = {
                instanceId: nanoid(),
                blockId,
                sequence: state.nextSequence,
            }

            state.nextSequence += 1

            state.blocks.push(newInstance)
        },
        removeProgramBlock(state, action: PayloadAction<string>) {
            const instanceId = action.payload
            state.blocks = state.blocks.filter((item) => item.instanceId !== instanceId)
        },
        reorderProgramBlock(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
            const { fromIndex, toIndex } = action.payload
            if (fromIndex === toIndex) return

            const [movedItem] = state.blocks.splice(fromIndex, 1)
            state.blocks.splice(toIndex, 0, movedItem)
        },
    },
})

export const { addProgramBlock, removeProgramBlock, reorderProgramBlock } = programSlice.actions
export const programReducer = programSlice.reducer

export const selectProgramBlocks = (state: RootState) => state.program.blocks

export const selectProgramBlocksWithDefinitions = createSelector(
    [selectProgramBlocks, selectBlockDefinitions],
    (instances, definitions) =>
        instances
            .map((inst) => {
                const definition = definitions.find((definition) => definition.id === inst.blockId)
                if (!definition) return null
                return {
                    instanceId: inst.instanceId,
                    blockId: inst.blockId,
                    definition,
                    sequence: inst.sequence,
                }
            })
            .filter(
                (
                    x,
                ): x is {
                    instanceId: string
                    blockId: BlockType
                    definition: BlockDefinition
                    sequence: number
                } => x !== null,
            ),
)
