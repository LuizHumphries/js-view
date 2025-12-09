import { configureStore } from '@reduxjs/toolkit'
import { blocksReducer } from '../features/blocks/blocksSlice'

export const store = configureStore({
    reducer: {
        blocks: blocksReducer,
        // program: programReducer,
        // blocks: blocksReducer,
        // simulation: simulationReducer,
        // ...
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
