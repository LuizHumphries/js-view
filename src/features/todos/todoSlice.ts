import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { Todo, TodosState } from './todoTypes'

const initialState: TodosState = {
    items: [],
}

export const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        addTodo: {
            reducer(state, action: PayloadAction<Todo>) {
                state.items.push(action.payload)
            },
            prepare(title: string) {
                return { payload: { id: nanoid(), title, completed: false } as Todo }
            },
        },
        editTodoTitle: {
            reducer(state, action: PayloadAction<{ id: string; title: string }>) {
                const todo = state.items.find((item) => item.id === action.payload.id)
                if (todo) {
                    todo.title = action.payload.title
                }
            },
            prepare(id: string, title: string) {
                return { payload: { id, title } }
            },
        },

        toggleTodo(state, action: PayloadAction<string>) {
            const id = action.payload
            const todo = state.items.find((item) => item.id === id)

            if (todo) {
                todo.completed = !todo.completed
            }
        },
        removeTodo(state, action: PayloadAction<string>) {
            const id = action.payload
            state.items = state.items.filter((item) => item.id !== id)
        },
        clearCompleted(state) {
            state.items = state.items.filter((item) => !item.completed)
        },
    },
})

export const { addTodo, toggleTodo, removeTodo, clearCompleted } = todoSlice.actions
export const todoReducer = todoSlice.reducer
