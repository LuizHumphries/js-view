import type { BlockDefinition } from '../blocks/types'
import { getConsoleMessagesForBlock } from './LogMessage'
import type { ProgramBlockInstance } from './types'
import { getTimeoutDelayMs } from '../simulation/compileBlocksToOps'
import { sequenceToLabel } from './sequenceUtils'

// Re-export for backward compatibility
export { sequenceToLabel }

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
                    `  await null;`,
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
                const delayMs = getTimeoutDelayMs(instance.sequence)
                lines.push(
                    `setTimeout(() => {`,
                    `   console.log("${msg}");`,
                    `}, ${delayMs});\n`,
                )
                break
            }
        }
    }
    return lines.join('\n')
}
