import { useAppSelector } from '../../store/hooks'

export default function BlockList() {
    const blocks = useAppSelector((state) => state.blocks.available)

    console.log(blocks)
    return (
        <section className="p-4">
            <div className="flex flex-col gap-4">
                {blocks.map((block) => {
                    return (
                        <div className="flex w-96 flex-row gap-2 rounded-2xl border border-amber-500 p-4">
                            <span className="flex w-24 items-center justify-center rounded-full bg-amber-700 p-2 text-white">
                                {block.category}
                            </span>
                            <button title={block.description}>{block.title}</button>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
