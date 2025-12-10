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
            description: 'Bloco síncrono que loga direto na call stack.',
            category: 'sync',
            complexityLevel: 1,
            exampleCode: 'console.log("A");',
        },
        {
            id: 'promiseThen',
            type: 'promiseThen',
            title: 'Promise.resolve().then()',
            description: 'Bloco que adiciona o .then como microtask.',
            category: 'microtask',
            complexityLevel: 1,
            exampleCode: 'Promise.resolve("A").then(() => console.log("Promise A"));',
        },
        {
            id: 'forLoop',
            type: 'forLoop',
            title: 'For Loop',
            description: 'Bloco que adiciona o loop que é rodado imediatamente na call stack.',
            category: 'loop',
            complexityLevel: 1,
            exampleCode: 'for (let i = 0; i < 3; i++) { console.log(i); }',
        },
        {
            id: 'timeout',
            type: 'timeout',
            title: 'setTimeout',
            description:
                'Bloco setado para a macrotask pelo host, aguardando o tempo setado, para rodar (quando sua vez).',
            category: 'macrotask',
            complexityLevel: 1,
            exampleCode: 'setTimeout(() => { console.log("Timeout A"); }, 0);',
        },
        {
            id: 'asyncAwait',
            type: 'asyncAwait',
            title: 'Async Await',
            description:
                'O Await faz com que a execução seja parada e o que rodaria depois, dentro da função, roda só depois que a microtask executa.',
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
