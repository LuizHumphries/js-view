import { configureStore } from '@reduxjs/toolkit'
import { blocksReducer } from '../features/blocks/blocksSlice'
import { programReducer } from '../features/program/programSlice'
import { simulationReducer } from '../features/simulation/simulationSlice'

export const store = configureStore({
    reducer: {
        blocks: blocksReducer,
        program: programReducer,
        simulation: simulationReducer,
        // ...
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
