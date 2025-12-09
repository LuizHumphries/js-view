import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addProgramBlock } from '../program/programSlice'
import { selectBlockDefinitions } from './blocksSlice'

export default function BlockList() {
    const blocks = useAppSelector(selectBlockDefinitions)
    const dispatch = useAppDispatch()

    return (
        <section className="p-4">
            <div className="flex flex-col gap-4">
                {blocks.map((block) => {
                    return (
                        <button
                            key={block.id}
                            onClick={() => dispatch(addProgramBlock(block.id))}
                            title={block.description}
                            className="flex w-96 flex-row items-center gap-2 rounded-2xl border border-amber-500 p-4"
                        >
                            <span className="flex w-24 items-center justify-center rounded-full bg-amber-700 p-2 text-white">
                                {block.category}
                            </span>
                            <span>{block.title}</span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
