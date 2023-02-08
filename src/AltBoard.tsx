import { DocumentId, Repo } from "automerge-repo"
import { Widget, WidgetView } from "./widgets"
import { useDocument } from "automerge-repo-react-hooks"
import React, { useRef, useState } from "react"
import classNames from "classnames"

export interface MoveWidgetDragData {
  type: "move"
  offsetX: number
  offsetY: number
  index: number
}

type DragData = MoveWidgetDragData

const INITIAL_WIDGETS: BoardWidget[] = [
  {
    x: 100,
    y: 100,
    width: 300,
    height: 300,
    widget: {
      type: "map",
      includedWidgets: [],
    },
  },
  {
    x: 400,
    y: 100,
    width: 300,
    height: 300,
    widget: {
      type: "weather",
    },
  },
]

export function createBoardDoc(repo: Repo) {
  const handle = repo.create<BoardDoc>()

  handle.change((doc) => {
    doc.widgets = INITIAL_WIDGETS
  })

  return handle
}

interface BoardDoc {
  widgets: BoardWidget[]
}

interface BoardWidget {
  widget: Widget
  x: number
  y: number
  width: number
  height: number
}

interface BoardViewDoc {
  docId: DocumentId
}

export function BoardView({ docId }: BoardViewDoc) {
  const [doc, changeDoc] = useDocument<BoardDoc>(docId)

  if (!doc) {
    return null
  }

  const onDragEnter = (evt: React.DragEvent) => {
    evt.preventDefault()
  }

  const onDragOver = (evt: React.DragEvent) => {
    evt.preventDefault()
  }

  const onDrop = (evt: React.DragEvent) => {
    const dragData = JSON.parse(evt.dataTransfer.getData("application/drag-data")) as DragData

    changeDoc((doc) => {
      let widget: BoardWidget | undefined

      switch (dragData.type) {
        case "move":
          widget = doc.widgets[dragData.index]
          break
      }

      if (!widget) {
        return
      }

      widget.x = evt.pageX - dragData.offsetX
      widget.y = evt.pageY - dragData.offsetY
    })
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
      {doc.widgets.map((boardWidget, index) => (
        <BoardWidgetView
          x={boardWidget.x}
          y={boardWidget.y}
          width={boardWidget.width}
          height={boardWidget.height}
          widget={boardWidget.widget}
          key={index}
          index={index}
          onChange={(changeWidget) => {
            changeDoc((doc) => changeWidget(doc.widgets[index].widget))
          }}
        />
      ))}
    </div>
  )
}

interface BoardWidgetView {
  index: number
  x: number
  y: number
  width: number
  height: number
  widget: Widget
  onChange: (fn: (widget: Widget) => void) => void
}

function BoardWidgetView({ widget, x, y, width, height, onChange, index }: BoardWidgetView) {
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
        index: index,
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
        transform: `translate(${x}px,${y}px)`,
        width: width,
        height: height,
      }}
    >
      <div className="rounded bg-white shadow overflow-auto w-full h-full flex flex-col">
        <WidgetView widget={widget} onChange={onChange} />
      </div>
    </div>
  )
}
