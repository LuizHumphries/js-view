export type BlockType = 'console' | 'promiseThen' | 'asyncAwait' | 'timeout' | 'forLoop'
export type BlockCategory = 'sync' | 'microtask' | 'macrotask' | 'loop'

export interface BlockDefinition {
    id: BlockType
    type: BlockType
    title: string
    description: string
    category: BlockCategory
    exampleCode?: string
    complexityLevel?: 1 | 2 | 3
}
