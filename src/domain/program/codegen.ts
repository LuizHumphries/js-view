import type { BlockDefinition } from '../blocks/types'
import type { ProgramBlockInstance } from './types'

function sequenceToLabel(sequence: number): string {
    let label = ''

    while (sequence >= 0) {
        label = String.fromCharCode(65 + (sequence % 26)) + label
        sequence = Math.floor(sequence / 26) - 1
    }
    return label
}

export function generateProgramCode(
    instances: ProgramBlockInstance[],
    definitions: BlockDefinition[],
): string {
    const blocksWithDef = instances
        .map((inst) => {
            const def = definitions.find((d) => d.id === inst.blockId)
            if (!def) return null
            return { instance: inst, definition: def }
        })
        .filter(
            (x): x is { instance: ProgramBlockInstance; definition: BlockDefinition } => x !== null,
        )

    const lines: string[] = []

    for (const { instance, definition } of blocksWithDef) {
        const label = sequenceToLabel(instance.sequence)

        switch (definition.type) {
            case 'console':
                lines.push(`console.log("${label}");\n`)
                break
            case 'forLoop':
                lines.push(
                    `for (let i = 0; i < 2; i++) {`,
                    `   console.log("For Loop: ${label}");`,
                    `}\n`,
                )
                break
            case 'asyncAwait':
                lines.push(
                    `async function run${label}() {`,
                    `  console.log("PRE await ${label}");`,
                    `  await someFunction${label}();`,
                    `  console.log("POST await ${label}");`,
                    `}\n`,
                    `run${label}();\n`,
                )
                break
            case 'promiseThen':
                lines.push(
                    `Promise.resolve("_").then(() => {`,
                    `   console.log("Promise ${label}");`,
                    `});\n`,
                )
                break
            case 'timeout':
                lines.push(
                    `setTimeout(() => {`,
                    `   console.log("setTimeout ${label}");`,
                    ` }, 1);\n`,
                )
                break
        }
    }
    return lines.join('\n')
}
