import {
  createRef,
  EntityData,
  EntityRef,
  UnknownEntityRef,
  useCreateEntity,
  useEntities,
} from "../db"
import { WidgetView } from "./index"
import { CreateWidgetDragData, DragData, WidgetEntityProps } from "../Board"
import { useRef, useState } from "react"
import classNames from "classnames"
import { EntityViewProps, ViewType } from "./ViewType"

export interface ListEntityProps {
  items: UnknownEntityRef[]
}

export interface ListViewProps extends EntityViewProps<ListEntityProps> {
  allowDrop?: boolean
}

export function ListView({ entity, allowDrop = true }: ListViewProps) {
  const [isDraggedOver, setIsDraggedOver] = useState(false)
  const createEntity = useCreateEntity()
  const entities = useEntities()

  return (
    <div
      onDragEnter={(evt) => {
        if (allowDrop) {
          evt.preventDefault()
          setIsDraggedOver(true)
        }
      }}
      onDragOver={(evt) => {
        if (allowDrop) {
          evt.preventDefault()
          setIsDraggedOver(true)
        }
      }}
      onDragLeave={() => {
        if (allowDrop) {
          setIsDraggedOver(false)
        }
      }}
      onDrop={(evt) => {
        if (!allowDrop) {
          return
        }

        setIsDraggedOver(false)
        evt.stopPropagation()
        const dragData = JSON.parse(evt.dataTransfer.getData("application/drag-data")) as DragData

        let widget: EntityRef<WidgetEntityProps> | undefined

        switch (dragData.type) {
          case "create":
            widget = createEntity(dragData.entityData) as EntityRef<WidgetEntityProps>
            break

          case "move":
            widget = entities[dragData.entityId] as EntityRef<WidgetEntityProps>
            break
        }

        if (!widget) {
          return
        }

        // this is a bit hacky, but because the board includes all entities that have a size and position, this is the only way to remove a widget from the board
        widget.retract("x")
        widget.retract("y")
        widget.retract("width")
        widget.retract("height")

        entity.replace("items", entity.data.items.concat([widget]))
      }}
      className={classNames(
        "border rounded-b h-full w-full",
        isDraggedOver ? "border-blue-500" : "border-white"
      )}
    >
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

const viewType: ViewType = {
  name: "List",
  condition: (data: EntityData) => data.items,
  view: ListView,
}

export default viewType
