import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    removeProgramBlock,
    reorderProgramBlock,
    selectProgramBlocksWithDefinitions,
} from './programSlice'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
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
        <section className="flex h-full min-h-0 flex-1 flex-col rounded-xl bg-bg-block p-4">
            <div className="mb-3 rounded-xl border border-dashed border-border-subtle bg-bg-panel/40 px-3 py-2">
                <p className="text-xs text-text-muted">
                    Sequência de execução: arraste os blocos para reorganizá-los.
                </p>
                <p className="mt-1 text-xs text-text-muted">
                    Clique em <span className="font-semibold text-text-primary">Código</span> para
                    verificar o código gerado.
                </p>
            </div>

            <main className="program-scroll min-h-0 w-full flex-1 touch-pan-y overflow-y-auto scroll-smooth rounded-xl bg-bg-block [scrollbar-gutter:stable]">
                <DndContext
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                        <div className="flex min-h-full w-full flex-col items-start gap-3 p-5">
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
            </main>
        </section>
    )
}
