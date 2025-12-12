import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addProgramBlock } from '../program/programSlice'
import { selectBlockDefinitions } from './blocksSlice'
import Block from '../../components/block/Block'

type BlockListProps = {
    fullWidth?: boolean
    showHeader?: boolean
    onBlockAdded?: () => void
}

export default function BlockList({
    fullWidth = false,
    showHeader = true,
    onBlockAdded,
}: BlockListProps) {
    const blocks = useAppSelector(selectBlockDefinitions)
    const dispatch = useAppDispatch()

    return (
        <section className="flex flex-col">
            {showHeader && (
                <header className="flex flex-col items-center gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1 text-center">
                    <h2 className="font-bold tracking-wide text-text-primary uppercase">
                        Blocos disponíveis
                    </h2>
                    <span className="text-sm tracking-wide text-text-muted uppercase">
                        (Clique para adicionar)
                    </span>
                </header>
            )}
            <main
                className={[
                    'flex h-full w-full flex-col gap-4 bg-bg-block p-5',
                    showHeader ? 'rounded-b-xl' : 'rounded-xl',
                    fullWidth ? 'items-stretch' : 'items-center sm:w-68',
                ].join(' ')}
            >
                {blocks.map((block) => (
                    <Block
                        onClick={() => {
                            dispatch(addProgramBlock(block.id))
                            onBlockAdded?.()
                        }}
                        definition={block}
                        key={block.id}
                    />
                ))}
            </main>
        </section>
    )
}
