import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { removeProgramBlock, selectProgramBlocksWithDefinitions } from './programSlice'

export default function ProgramSandBox() {
    const programBlocks = useAppSelector(selectProgramBlocksWithDefinitions)
    const dispatch = useAppDispatch()

    return (
        <section className="p-4">
            <div className="flex flex-col gap-4">
                {programBlocks.map((block) => {
                    return (
                        <button
                            key={block.instanceId}
                            onClick={() => dispatch(removeProgramBlock(block.instanceId))}
                            title={block.definition.description}
                            className="flex w-96 flex-row items-center gap-2 rounded-2xl border border-amber-500 p-4"
                        >
                            <span className="flex w-24 items-center justify-center rounded-full bg-amber-700 p-2 text-white">
                                {block.definition.category}
                            </span>
                            <span>{block.definition.title}</span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
