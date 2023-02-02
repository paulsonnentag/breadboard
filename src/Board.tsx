import { EntityData, EntityRef, useCreateEntity, useEntities, useFacts } from "./db"
import React, { useRef, useState } from "react"
import classNames from "classnames"
import { WidgetView } from "./views"
import WidgetBar from "./WidgetBar"
import { getWidgets } from "./computations"

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
  const facts = useFacts()
  const [isDebugMode, setIsDebugMode] = useState(false)

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
        <WidgetContainer widget={widget} key={widget.id} />
      ))}

      <div className="fixed top-3 left-3">
        <WidgetBar />
      </div>

      <div className="fixed top-0 right-3 bottom-0 overflow-auto pt-10">
        {isDebugMode &&
          facts.map((fact, index) => {
            const value = JSON.stringify(fact.value)
            return (
              <div key={index}>
                [{""} {fact.e.slice(0, 7)} {fact.key}{" "}
                <span className="text-blue-500">
                  {value.length > 50 ? `${value.slice(0, 50)} ...` : value}
                </span>{" "}
                ]
              </div>
            )
          })}
      </div>
      <div className="fixed top-3 right-3">
        <label className="flex gap-1">
          <input
            type="checkbox"
            checked={isDebugMode}
            onChange={() => {
              setIsDebugMode((isDebugMode) => !isDebugMode)
            }}
          />
          debug mode
        </label>
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

interface WidgetContainerProps {
  widget: EntityRef<WidgetEntityProps>
}

function WidgetContainer({ widget }: WidgetContainerProps) {
  const [isDragged, setIsDragged] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const onDragStart = (evt: React.DragEvent) => {
    console.log("drag start")

    if (!ref.current) {
      return
    }

    var bounds = ref.current.getBoundingClientRect()

    evt.dataTransfer.setData(
      "application/drag-data",
      JSON.stringify({
        type: "move",
        entityId: widget.id,
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
        top: widget.data.y,
        left: widget.data.x,
        width: widget.data.width,
        height: widget.data.height,
      }}
    >
      <WidgetView entity={widget} />
    </div>
  )
}
