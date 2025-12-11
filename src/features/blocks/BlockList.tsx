import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addProgramBlock } from '../program/programSlice'
import { selectBlockDefinitions } from './blocksSlice'
import Block from '../../components/block/Block'

export default function BlockList() {
    const blocks = useAppSelector(selectBlockDefinitions)
    const dispatch = useAppDispatch()

    return (
        <section className="flex flex-col">
            <header className="flex flex-col items-center gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1 text-center">
                <h2 className="font-bold tracking-wide text-text-primary uppercase">
                    Available blocks
                </h2>
                <span className="text-sm tracking-wide text-text-muted uppercase">
                    (Click to select)
                </span>
            </header>
            <main className="flex h-full w-68 flex-col items-center gap-4 rounded-b-xl bg-bg-block p-5">
                {blocks.map((block) => (
                    <Block
                        onClick={() => dispatch(addProgramBlock(block.id))}
                        definition={block}
                        key={block.id}
                    />
                ))}
            </main>
        </section>
    )
}
