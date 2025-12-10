export type BlockType = 'console' | 'forLoop' | 'promiseThen' | 'asyncAwait' | 'timeout'
export type BlockCategory = 'sync' | 'microtask' | 'macrotask' | 'loop'

export type BlockDefinition = {
    id: BlockType
    type: BlockType
    title: string
    description: string
    category: BlockCategory
    exampleCode?: string
    complexityLevel?: 1 | 2 | 3
}
