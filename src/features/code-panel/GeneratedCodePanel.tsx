import { generateProgramCode } from '../../domain/program/codegen'
import { useAppSelector } from '../../store/hooks'
import { selectBlockDefinitions } from '../blocks/blocksSlice'
import { selectProgramBlocks } from '../program/programSlice'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism'

type GeneratedCodePanelProps = {
    showHeader?: boolean
}

export default function GeneratedCodePanel({ showHeader = true }: GeneratedCodePanelProps) {
    const instances = useAppSelector(selectProgramBlocks)
    const definitions = useAppSelector(selectBlockDefinitions)

    const code = generateProgramCode(instances, definitions)

    return (
        <section className="flex min-h-0 flex-1 flex-col">
            {showHeader && (
                <header className="flex flex-row items-center gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1">
                    <h2 className="font-bold tracking-wide text-text-primary uppercase">
                        Código gerado
                    </h2>
                    <span className="text-sm tracking-wide text-text-muted uppercase">
                        (Somente leitura)
                    </span>
                </header>
            )}
            <main
                className={[
                    'program-scroll w-full flex-1 overflow-y-auto scroll-smooth bg-bg-block [scrollbar-gutter:stable]',
                    showHeader ? 'rounded-b-xl' : 'rounded-xl',
                ].join(' ')}
            >
                <SyntaxHighlighter
                    language="javascript"
                    showLineNumbers
                    wrapLongLines
                    style={xonokai}
                    customStyle={{
                        margin: 0,
                        backgroundColor: 'var(--bg-block)',
                        padding: '0.75rem',
                        borderWidth: 0,
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                        lineHeight: 1.15,
                        height: '100%',
                        overflowX: 'hidden',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                    codeTagProps={{
                        style: {
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        },
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </main>
        </section>
    )
}
