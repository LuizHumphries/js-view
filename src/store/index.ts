import { configureStore } from '@reduxjs/toolkit'
import { todoReducer } from '../features/todos/todoSlice'

export const store = configureStore({
    reducer: {
        todos: todoReducer,
        // program: programReducer,
        // blocks: blocksReducer,
        // simulation: simulationReducer,
        // ...
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
