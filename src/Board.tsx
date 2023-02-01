import { EntityRef, useEntities } from "./db"
import React, { useMemo, useRef, useState } from "react"
import classNames from "classnames"

export function Board() {
  const entities = useEntities()
  const widgets = Object.values(entities).filter(
    (entity) =>
      entity.data.width !== undefined &&
      entity.data.height !== undefined &&
      entity.data.x !== undefined &&
      entity.data.y !== undefined
  ) as EntityRef<WidgetEntityProps>[]

  const onDragEnter = (evt: React.DragEvent) => {
    evt.preventDefault()
  }

  const onDragOver = (evt: React.DragEvent) => {
    evt.preventDefault()
  }

  const onDrop = (evt: React.DragEvent) => {
    const id = evt.dataTransfer.getData("application/entity-id")
    const offsetX = parseInt(evt.dataTransfer.getData("application/offset-x"))
    const offsetY = parseInt(evt.dataTransfer.getData("application/offset-y"))
    const widget = entities[id] as EntityRef<WidgetEntityProps>

    if (!widget) {
      return
    }

    widget.replace("x", evt.pageX - offsetX)
    widget.replace("y", evt.pageY - offsetY)
  }

  return (
    <div
      className="overflow-hidden relative bg-gray-100"
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
    </div>
  )
}

interface WidgetEntityProps {
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
    if (!ref.current) {
      return
    }

    var bounds = ref.current.getBoundingClientRect()
    var x = evt.clientX - bounds.left
    var y = evt.clientY - bounds.top

    evt.dataTransfer.setData("application/entity-id", widget.id)
    evt.dataTransfer.setData("application/offset-x", x.toString())
    evt.dataTransfer.setData("application/offset-y", y.toString())
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
      className={classNames("absolute border-b-gray-300 rounded bg-white shadow", {
        "opacity-0": isDragged,
      })}
      style={{
        top: widget.data.y,
        left: widget.data.x,
        width: widget.data.width,
        height: widget.data.height,
      }}
    ></div>
  )
}
