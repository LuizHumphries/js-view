import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    removeProgramBlock,
    reorderProgramBlock,
    selectProgramBlocksWithDefinitions,
} from './programSlice'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableProgramBlock from './SortableProgramBlock'
import { useMemo, useState } from 'react'
import Block from '../../components/block/Block'

export default function ProgramSandBox() {
    const programBlocks = useAppSelector(selectProgramBlocksWithDefinitions)
    const sortableIds = programBlocks.map((block) => block.instanceId)
    const dispatch = useAppDispatch()
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeSize, setActiveSize] = useState<{ width: number; height: number } | null>(null)

    const sensors = useSensors(
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 6 },
        }),
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
    )

    const activeBlock = useMemo(() => {
        if (!activeId) return null
        return programBlocks.find((b) => b.instanceId === activeId) ?? null
    }, [activeId, programBlocks])

    function handleDragStart(event: DragStartEvent) {
        setActiveId(String(event.active.id))
        const initial = event.active.rect.current.initial
        if (initial) {
            setActiveSize({ width: initial.width, height: initial.height })
        } else {
            setActiveSize(null)
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        setActiveId(null)
        setActiveSize(null)

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
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => {
                        setActiveId(null)
                        setActiveSize(null)
                    }}
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

                    <DragOverlay>
                        {activeBlock ? (
                            <div
                                className="pointer-events-none"
                                style={{
                                    width: activeSize?.width,
                                    height: activeSize?.height,
                                }}
                            >
                                <Block
                                    hasIconBg={false}
                                    hasCodeDefinition={false}
                                    definition={activeBlock.definition}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </main>
        </section>
    )
}
