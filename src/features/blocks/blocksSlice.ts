import { createSlice } from '@reduxjs/toolkit'
import type { BlockDefinition } from '../../domain/blocks/types'
import type { RootState } from '../../store'

export type BlocksState = {
    available: BlockDefinition[]
}

const initialState: BlocksState = {
    available: [
        {
            id: 'console',
            type: 'console',
            title: 'console.log',
            description: 'Síncrono: entra na Call Stack, executa e sai.',
            category: 'sync',
            complexityLevel: 1,
            exampleCode: 'console.log("A");',
        },
        {
            id: 'promiseThen',
            type: 'promiseThen',
            title: 'Promise.resolve().then()',
            description: 'Resolve a Promise agora e agenda o .then na Microtask Queue.',
            category: 'microtask',
            complexityLevel: 1,
            exampleCode: 'Promise.resolve("A").then(() => console.log("Promise A"));',
        },
        {
            id: 'forLoop',
            type: 'forLoop',
            title: 'For Loop',
            description: 'Síncrono: roda o loop e empilha cada iteração na Call Stack.',
            category: 'loop',
            complexityLevel: 1,
            exampleCode: 'for (let i = 0; i < 3; i++) { console.log(i); }',
        },
        {
            id: 'timeout',
            type: 'timeout',
            title: 'setTimeout',
            description: 'Registra na Web API e depois entra na Macrotask Queue quando o timer expira.',
            category: 'macrotask',
            complexityLevel: 1,
            exampleCode: 'setTimeout(() => { console.log("Timeout A"); }, 0);',
        },
        {
            id: 'asyncAwait',
            type: 'asyncAwait',
            title: 'Async Await',
            description: 'Executa até o await e agenda a continuação na Microtask Queue.',
            category: 'microtask',
            complexityLevel: 1,
            exampleCode:
                'async function run() { console.log("Pre await"); await someFunction(); console.log("Post await"); } run();',
        },
    ],
}

export const blocksSlice = createSlice({
    name: 'blocks',
    initialState,
    reducers: {
        // MVP: sem reducers mesmo.
        // Futuro: registerCustomBlock, resetPallete, etc.
    },
})

export const blocksReducer = blocksSlice.reducer

export const selectBlockDefinitions = (state: RootState) => state.blocks.available
