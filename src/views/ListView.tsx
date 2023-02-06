import { createRef, EntityData, UnknownEntityRef } from "../db"
import { EntityViewProps, registerViewType } from "./view-type-registry"
import { WidgetView } from "./index"
import { CreateWidgetDragData } from "../Board"
import { useRef } from "react"

export interface ListEntityProps {
  items: UnknownEntityRef[]
}

function ListView({ entity }: EntityViewProps<ListEntityProps>) {
  return (
    <div>
      {entity.data.items.map((item, index) => (
        <DraggableItem entity={item} key={index} />
      ))}
    </div>
  )
}

function DraggableItem({ entity }: EntityViewProps<Partial<EntityData>>) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className="cursor-grab"
      draggable
      ref={ref}
      onDragStart={(evt) => {
        evt.stopPropagation()

        if (!ref.current) {
          return
        }

        const bounds = ref.current.getBoundingClientRect()

        evt.dataTransfer.setData(
          "application/drag-data",
          JSON.stringify({
            type: "create",
            entityData: {
              width: 200,
              height: 100,
              type: "item",
              item: entity.toRefId(),
            },
            offsetX: evt.clientX - bounds.left,
            offsetY: evt.clientY - bounds.top,
          } as CreateWidgetDragData)
        )
        evt.dataTransfer.dropEffect = "copy"
      }}
    >
      <WidgetView entity={entity} />
    </div>
  )
}

registerViewType({
  name: "List",
  condition: (data: EntityData) => data.items,
  view: ListView,
})
