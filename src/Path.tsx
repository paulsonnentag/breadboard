import { DocumentId, Repo } from "automerge-repo"
import { getMapLocations, Widget, WidgetView } from "./widgets"
import { useDocument } from "automerge-repo-react-hooks"
import React, { useRef, useState } from "react"
import classNames from "classnames"
import { uuid } from "@automerge/automerge"
import moment from "moment"
import { WeatherWidget } from "./widgets/WeatherWidget"
import { Cross2Icon } from "@radix-ui/react-icons"
import WidgetBar from "./WidgetBar"
import { MapWidget } from "./widgets/MapWidget"
import { PoiFinderWidget } from "./widgets/PoiFinderWidget"
import { v4 } from "uuid"

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

export function createPathDoc(repo: Repo) {
  const handle = repo.create<PathDoc>()

  handle.change((doc) => {
    doc.widgets = []
  })

  return handle
}

interface PathDoc {
  widgets: Widget[]
}

interface PathViewDoc {
  documentId: DocumentId
}

export function PathView({ documentId }: PathViewDoc) {
  const [doc, changeDoc] = useDocument<PathDoc>(documentId)

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

  const widgets = doc.widgets

  const locations = getMapLocations(widgets)

  const onAddMap = () => {
    changeDoc((doc: PathDoc) => {
      doc.widgets.push({
        id: v4(),
        type: "map",
        location: {
          name: "current location",
          latLng: {
            lat: 50.7753,
            lng: 6.0839,
          },
        },
      } as MapWidget)
    })
  }

  const onAddCampgroundFinder = () => {
    changeDoc((doc: PathDoc) => {
      doc.widgets.push({
        id: v4(),
        type: "poiFinder",
      } as PoiFinderWidget)
    })
  }

  return (
    <div
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      className="p-2 flex flex-col gap-2"
    >
      <div className="flex gap-1">
        {locations.map((location, index) => {
          return (
            <button className="bg-white text-purple-700 p-2 rounded-xl" key={index}>
              {location.name}
            </button>
          )
        })}

        <button className="bg-gray-500 text-white p-2 rounded-xl" onClick={onAddMap}>
          + Map
        </button>

        <button className="bg-gray-500 text-white p-2 rounded-xl" onClick={onAddCampgroundFinder}>
          + Campground finder
        </button>
      </div>

      <div className="flex gap-2">
        {widgets.map((widget, index) => (
          <div className="w-[500px] h-[500px]" key={index}>
            <WidgetView
              key={index}
              widget={widget}
              widgetsInScope={widgets}
              onChange={(changeWidget) => {
                changeDoc((doc) => {
                  changeWidget(doc.widgets[index])
                })
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
