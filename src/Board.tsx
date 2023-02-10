import { DocumentId, Repo } from "automerge-repo"
import { Widget, WidgetView } from "./widgets"
import { useDocument } from "automerge-repo-react-hooks"
import React, { useRef, useState } from "react"
import classNames from "classnames"
import { uuid } from "@automerge/automerge"
import moment from "moment"
import { WeatherWidget } from "./widgets/WeatherWidget"

export interface MoveWidgetDragData {
  type: "move"
  offsetX: number
  offsetY: number
  index: number
}

export interface CreateWidgetDragData {
  type: "create"
  offsetX: number
  offsetY: number
  width: number
  height: number
  widget: Widget
}

type DragData = MoveWidgetDragData | CreateWidgetDragData

const INITIAL_WIDGETS: WidgetOnBoard[] = [
  {
    x: 100,
    y: 100,
    width: 600,
    height: 600,
    widget: {
      id: uuid(),
      type: "map",
      locationWidget: {
        id: uuid(),
        type: "location",
        name: "current location",
        latLng: {
          lat: 50.775555,
          lng: 6.083611,
        },
      },
    },
  },
  {
    x: 800,
    y: 800,
    width: 400,
    height: 600,
    widget: {
      id: uuid(),
      type: "poiFinder",
    },
  },
  {
    x: 800,
    y: 100,
    width: 400,
    height: 300,
    widget: {
      id: uuid(),
      type: "weather",
      calendarWidget: {
        id: uuid(),
        type: "calendar",
        date: moment().unix() * 1000,
      },
    } as WeatherWidget,
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
  widgets: WidgetOnBoard[]
}

interface WidgetOnBoard {
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

    const x = evt.pageX - dragData.offsetX
    const y = evt.pageY - dragData.offsetY

    changeDoc((doc) => {
      switch (dragData.type) {
        case "create":
          const widgetOnBoard = {
            x: x,
            y: y,
            width: dragData.width,
            height: dragData.height,
            widget: dragData.widget,
          }

          doc.widgets.push(widgetOnBoard)
          break

        case "move": {
          const widgetOnBoard = doc.widgets[dragData.index]
          widgetOnBoard.x = x
          widgetOnBoard.y = y
          break
        }
      }
    })
  }

  const boardWidgets = doc.widgets

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
      {boardWidgets.map((boardWidget, index) => (
        <BoardWidgetView
          x={boardWidget.x}
          y={boardWidget.y}
          boardWidgets={boardWidgets}
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
  boardWidgets: WidgetOnBoard[]
  onChange: (fn: (widget: Widget) => void) => void
}

function BoardWidgetView({
  widget,
  boardWidgets,
  x,
  y,
  width,
  height,
  onChange,
  index,
}: BoardWidgetView) {
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

  const widgetsInScope = boardWidgets
    .map(({ widget }) => widget)
    .filter((otherWidget) => otherWidget.id !== widget.id)

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
      <div className="rounded-xl bg-white shadow w-full h-full flex flex-col">
        <WidgetView widget={widget} widgetsInScope={widgetsInScope} onChange={onChange} />
      </div>
    </div>
  )
}
