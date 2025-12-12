import { useSortable } from '@dnd-kit/sortable'
import type { BlockDefinition } from '../../domain/blocks/types'
import { CSS } from '@dnd-kit/utilities'
import { LucideTrash2 } from 'lucide-react'
import { Button } from '@base-ui-components/react'
import Block from '../../components/block/Block'
import { cn } from '../../utils/cn'

export type SortableProgramBlockProps = {
    instanceId: string
    definition: BlockDefinition
    onRemove: () => void
}

export default function SortableProgramBlock({
    instanceId,
    definition,
    onRemove,
}: SortableProgramBlockProps) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: instanceId,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            className={cn('flex w-full flex-row items-center gap-4')}
            style={style}
        >
            <div
                className={cn('flex-1', 'cursor-grab active:cursor-grabbing', 'touch-pan-y')}
                {...attributes}
                {...listeners}
            >
                <Block hasIconBg={false} definition={definition} hasCodeDefinition={false} />
            </div>
            <Button type="button" className="cursor-pointer" onClick={onRemove}>
                <LucideTrash2 className="h-5 w-5 stroke-red-600" />
            </Button>
        </div>
    )
}
