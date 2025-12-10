import { generateProgramCode } from '../../domain/program/codegen'
import { useAppSelector } from '../../store/hooks'
import { selectBlockDefinitions } from '../blocks/blocksSlice'
import { selectProgramBlocks } from '../program/programSlice'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function GeneratedCodePanel() {
    const instances = useAppSelector(selectProgramBlocks)
    const definitions = useAppSelector(selectBlockDefinitions)

    const code = generateProgramCode(instances, definitions)

    return (
        <section className="flex flex-col">
            <div className="flex flex-row items-center gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1">
                <h2 className="font-bold tracking-wide text-text-primary uppercase">
                    Generated Code
                </h2>
                <span className="text-sm tracking-wide text-text-muted uppercase">(Read only)</span>
            </div>
            <div className="program-scroll h-95 w-full overflow-y-auto scroll-smooth bg-bg-block">
                <SyntaxHighlighter
                    language="javascript"
                    showLineNumbers
                    style={xonokai}
                    customStyle={{
                        margin: 0,
                        backgroundColor: '#111827',
                        padding: '0.75rem',
                        borderWidth: 0,
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                        lineHeight: 1.15,
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </section>
    )
}
