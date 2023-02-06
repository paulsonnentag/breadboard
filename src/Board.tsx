import {
  EntityData,
  EntityMap,
  EntityRef,
  UnknownEntityRef,
  useCreateEntity,
  useEntities,
  useFacts,
} from "./db"
import React, { createElement, useRef, useState } from "react"
import classNames from "classnames"
import { WidgetView } from "./views"
import WidgetBar from "./WidgetBar"
import DebugView from "./DebugView"
import { Cross2Icon, DragHandleDots2Icon } from "@radix-ui/react-icons"
import { getSupportedViews } from "./views/view-type-registry"

export interface CreateWidgetDragData {
  type: "create"
  offsetX: number
  offsetY: number
  entityData: EntityData
}

export interface MoveWidgetDragData {
  type: "move"
  offsetX: number
  offsetY: number
  entityId: string
}

export type DragData = CreateWidgetDragData | MoveWidgetDragData

export function Board() {
  const entities = useEntities()
  const createEntity = useCreateEntity()
  const widgets = getWidgets(entities)

  const onDragEnter = (evt: React.DragEvent) => {
    evt.preventDefault()
  }

  const onDragOver = (evt: React.DragEvent) => {
    evt.preventDefault()
  }

  const onDrop = (evt: React.DragEvent) => {
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

    widget.replace("x", evt.pageX - dragData.offsetX)
    widget.replace("y", evt.pageY - dragData.offsetY)
  }

  return (
    <div
      className="overflow-hidden relative"
      style={{
        width: "300vw",
        height: "300vh",
      }}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
    >
      {widgets.map((widget) => (
        <WidgetContainer entity={widget} key={widget.id} />
      ))}

      <div className="fixed top-3 left-3">
        <WidgetBar />
      </div>

      <div className="fixed top-3 right-3">
        <DebugView />
      </div>
    </div>
  )
}

export interface WidgetEntityProps {
  x: number
  y: number
  width: number
  height: number
}

export function isWidget(entity: UnknownEntityRef): entity is EntityRef<WidgetEntityProps> {
  return (
    entity.data.width !== undefined &&
    entity.data.height !== undefined &&
    entity.data.x !== undefined &&
    entity.data.y !== undefined
  )
}

export function getWidgets(
  entities: UnknownEntityRef[] | EntityMap
): EntityRef<WidgetEntityProps>[] {
  return Object.values(entities).filter(isWidget)
}

interface WidgetContainerProps {
  entity: EntityRef<WidgetEntityProps>
}

function WidgetContainer({ entity }: WidgetContainerProps) {
  const [isDragged, setIsDragged] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const onDragStart = (evt: React.DragEvent) => {
    if (!ref.current) {
      return
    }

    var bounds = ref.current.getBoundingClientRect()

    evt.dataTransfer.setData(
      "application/drag-data",
      JSON.stringify({
        type: "move",
        entityId: entity.id,
        offsetX: evt.clientX - bounds.left,
        offsetY: evt.clientY - bounds.top,
      } as MoveWidgetDragData)
    )
    evt.dataTransfer.dropEffect = "move"

    setTimeout(() => setIsDragged(true))
  }

  const onDragEnd = () => {
    setTimeout(() => setIsDragged(false))
  }

  const supportedViews = getSupportedViews(entity.data)
  const selectedView = supportedViews[0]

  return (
    <div
      ref={ref}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={classNames("absolute", {
        "opacity-0": isDragged,
      })}
      style={{
        top: entity.data.y,
        left: entity.data.x,
        width: entity.data.width,
        height: entity.data.height,
      }}
    >
      <div className="rounded bg-white shadow overflow-auto w-full h-full flex flex-col">
        <div className="bg-gray p-1 text-xs text-gray-500 flex gap-1 border-b border-color-gray-100">
          <DragHandleDots2Icon />

          {selectedView.name}

          <div className="flex-1"></div>

          <button onClick={() => entity.destroy()}>
            <Cross2Icon />
          </button>
        </div>

        <div className="flex-1 overflow-auto">{createElement(selectedView.view, { entity })}</div>
      </div>
    </div>
  )
}
