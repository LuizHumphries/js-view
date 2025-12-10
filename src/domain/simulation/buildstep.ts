import { nanoid } from '@reduxjs/toolkit'
import type { ProgramBlockInstance } from '../program/types'
import type { SimulationStep } from './types'
import { getConsoleMessagesForBlock } from '../program/logmessage'

function createEmptyStep(): SimulationStep {
    return {
        id: 'step-0',
        callStack: [],
        microTaskQueue: [],
        macroTaskQueue: [],
        webApis: [],
        consoleOutput: [],
        description: 'Estado inicial',
    }
}

function buildStepFromBlock(previous: SimulationStep, block: ProgramBlockInstance): SimulationStep {
    const base: SimulationStep = {
        ...previous,
        id: nanoid(),
        description: '',
    }

    const messages = getConsoleMessagesForBlock(block)

    switch (block.blockId) {
        case 'console': {
            const label = `console (${block.instanceId})`

            return {
                ...base,
                callStack: [...base.callStack, label],
                consoleOutput: [...base.consoleOutput, ...messages],
                description:
                    'Executamos um bloco console.log (sincrono, entra na Call Stack e gera saída no console).',
            }
        }
        case 'timeout': {
            const label = `timeout (${block.instanceId})`

            return {
                ...base,
                webApis: [...base.webApis, label],
                macroTaskQueue: [...base.macroTaskQueue, ...messages],
                description:
                    'Registramos um setTimeout: ele vai para a Web API e seu callback é colocado na Macrotask Queue.',
            }
        }
        case 'promiseThen': {
            const label = `promiseThen (${block.instanceId})`

            return {
                ...base,
                microTaskQueue: [...base.microTaskQueue, `${label} callback`],
                description:
                    'Criamos uma Promise e o .then() adicionou um callback na Microtask Queue.',
            }
        }
        case 'asyncAwait': {
            const label = `asyncAwait (${block.instanceId})`

            return {
                ...base,
                microTaskQueue: [...base.microTaskQueue, `${label} continuação`],
                consoleOutput: [...base.consoleOutput, ...messages],
                description:
                    'Encontramos um bloco async/await: a parte assíncrona será retomada como microtask (continuação).',
            }
        }
        case 'forLoop': {
            const label = `forLoop (${block.instanceId})`

            return {
                ...base,
                callStack: [...base.callStack, label],
                consoleOutput: [...base.consoleOutput, ...messages],
                description:
                    'Executamos um for-loop sincrono: ele bloqueia a Call Stack enquanto roda, mas não usa filas assíncronas.',
            }
        }

        default: {
            return {
                ...base,
                description: 'Bloco com tipo desconhecido — mantivemos o estado anterior.',
            }
        }
    }
}

export function buildSimulation(blocks: ProgramBlockInstance[]): SimulationStep[] {
    const steps: SimulationStep[] = []

    let previousStep = createEmptyStep()

    const orderedBlocks = [...blocks].sort((a, b) => a.sequence - b.sequence)

    for (const block of orderedBlocks) {
        const nextStep = buildStepFromBlock(previousStep, block)
        steps.push(nextStep)
        previousStep = nextStep
    }
    return steps
}
