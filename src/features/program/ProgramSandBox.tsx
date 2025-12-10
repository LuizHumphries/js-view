import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    removeProgramBlock,
    reorderProgramBlock,
    selectProgramBlocksWithDefinitions,
} from './programSlice'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableProgramBlock from './SortableProgramBlock'

export default function ProgramSandBox() {
    const programBlocks = useAppSelector(selectProgramBlocksWithDefinitions)
    const sortableIds = programBlocks.map((block) => block.instanceId)
    const dispatch = useAppDispatch()

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over || active.id === over.id) return
        const fromIndex = programBlocks.findIndex((block) => block.instanceId === active.id)
        const toIndex = programBlocks.findIndex((block) => block.instanceId === over.id)

        if (fromIndex === -1 || toIndex === -1) return

        dispatch(reorderProgramBlock({ fromIndex, toIndex }))
    }

    return (
        <section className="flex h-full flex-col">
            <div className="flex flex-row items-center gap-2 rounded-t-xl bg-bg-block-hover px-5 py-1">
                <h2 className="font-bold tracking-wide text-text-primary uppercase">
                    Execution Thread
                </h2>
                <span className="text-sm tracking-wide text-text-muted uppercase">
                    (Drag to Reorder)
                </span>
            </div>
            <div className="program-scroll h-96 w-full overflow-y-auto scroll-smooth rounded-b-xl bg-bg-block">
                <DndContext onDragEnd={handleDragEnd}>
                    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col items-start gap-4 p-5">
                            {programBlocks.map((block) => {
                                return (
                                    <SortableProgramBlock
                                        definition={block.definition}
                                        instanceId={block.instanceId}
                                        onRemove={() =>
                                            dispatch(removeProgramBlock(block.instanceId))
                                        }
                                        key={block.instanceId}
                                    />
                                )
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </section>
    )
}
