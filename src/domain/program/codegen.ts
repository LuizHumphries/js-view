import type { BlockDefinition } from '../blocks/types'
import { getConsoleMessagesForBlock } from './logmessage'
import type { ProgramBlockInstance } from './types'

export function sequenceToLabel(sequence: number): string {
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
        const messages = getConsoleMessagesForBlock(instance)

        switch (definition.type) {
            case 'console': {
                const [msg] = messages
                lines.push(`console.log("${msg}");\n`)
                break
            }
            case 'forLoop': {
                lines.push(
                    `for (let i = 0; i < 2; i++) {`,
                    `   console.log(\`For Loop: ${label} \${i}\`);`,
                    `}\n`,
                )
                break
            }
            case 'asyncAwait': {
                const [preMsg, postMsg] = messages
                lines.push(
                    `async function run${label}() {`,
                    `  console.log("${preMsg}");`,
                    `  await someFunction${label}();`,
                    `  console.log("${postMsg}");`,
                    `}\n`,
                    `run${label}();\n`,
                )
                break
            }
            case 'promiseThen': {
                const [msg] = messages
                lines.push(
                    `Promise.resolve("_").then(() => {`,
                    `   console.log("${msg}");`,
                    `});\n`,
                )
                break
            }
            case 'timeout': {
                const [msg] = messages
                lines.push(`setTimeout(() => {`, `   console.log("${msg}");`, ` }, 1);\n`)
                break
            }
        }
    }
    return lines.join('\n')
}
