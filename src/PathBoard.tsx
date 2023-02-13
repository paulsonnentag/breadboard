import { DocumentId, Repo } from "automerge-repo"
import { getMapLocations, Widget, WidgetView } from "./widgets"
import React from "react"
import { WeatherWidget } from "./widgets/WeatherWidget"
import { MapWidget } from "./widgets/MapWidget"
import { PoiFinderWidget } from "./widgets/PoiFinderWidget"
import { v4 } from "uuid"
import { useDocument } from "automerge-repo-react-hooks"

export interface CreateWidgetDragData {
  type: "create"
  widget: Widget
}

type DragData = CreateWidgetDragData

export interface PathBoardDoc {
  paths: Path[]
}

export function createPathBoardDoc(repo: Repo) {
  const handle = repo.create<PathBoardDoc>()

  handle.change((doc) => {
    doc.paths = [{ widgets: [] }]
  })

  return handle
}

interface PathBoardViewProps {
  documentId: DocumentId
}

export function PathBoardView({ documentId }: PathBoardViewProps) {
  const [doc, onChange] = useDocument<PathBoardDoc>(documentId)

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
    evt.stopPropagation()
    const dragData = JSON.parse(evt.dataTransfer.getData("application/drag-data")) as DragData

    onChange((doc) => {
      switch (dragData.type) {
        case "create":
          doc.paths.push({ widgets: [dragData.widget] })
          break
      }
    })
  }

  return (
    <div
      className="w-screen h-screen overflow-auto"
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
    >
      <div className="mb-20">
        {doc.paths.map((path, index) => (
          <PathView
            path={path}
            onChange={(fn) => onChange((doc) => fn(doc.paths[index]))}
            key={index}
          />
        ))}
      </div>
    </div>
  )
}

interface Path {
  widgets: Widget[]
}

interface PathViewProps {
  path: Path
  onChange: (fn: (path: Path) => void) => void
}

export function PathView({ path, onChange }: PathViewProps) {
  const onDragEnter = (evt: React.DragEvent) => {
    evt.preventDefault()
  }

  const onDragOver = (evt: React.DragEvent) => {
    evt.preventDefault()
  }

  const onDrop = (evt: React.DragEvent) => {
    evt.stopPropagation()
    const dragData = JSON.parse(evt.dataTransfer.getData("application/drag-data")) as DragData

    onChange((path) => {
      switch (dragData.type) {
        case "create":
          path.widgets.push(dragData.widget)
          break
      }
    })
  }

  const widgets = path.widgets

  const locations = getMapLocations(widgets)

  const onAddMap = () => {
    onChange((path) => {
      path.widgets.push({
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
    onChange((path) => {
      path.widgets.push({
        id: v4(),
        type: "poiFinder",
      } as PoiFinderWidget)
    })
  }

  const onAddWeather = () => {
    onChange((path) => {
      path.widgets.push({
        id: v4(),
        type: "weather",
      } as WeatherWidget)
    })
  }

  return (
    <div
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      className="flex flex-col gap-2 py-2"
    >
      <div className="flex gap-2 px-2">
        <button className="bg-gray-500 text-white p-2 rounded-xl" onClick={onAddMap}>
          + Map
        </button>

        <button className="bg-gray-500 text-white p-2 rounded-xl" onClick={onAddCampgroundFinder}>
          + Campground finder
        </button>

        <button className="bg-gray-500 text-white p-2 rounded-xl" onClick={onAddWeather}>
          + Weather
        </button>
      </div>
      <div className="flex gap-2 px-2">
        {locations.map((location, index) => {
          return (
            <button className="bg-white text-purple-700 p-2 rounded-xl" key={index}>
              {location.name}
            </button>
          )
        })}
      </div>

      <div className="px-2 flex gap-2 overflow-auto">
        {widgets.map((widget, index) => (
          <div className="w-[400px] h-[400px] flex-shrink-0" key={index}>
            <WidgetView
              key={index}
              widget={widget}
              widgetsInScope={widgets}
              onChange={(changeWidget) => {
                onChange((path) => {
                  changeWidget(path.widgets[index])
                })
              }}
              onDestroy={() => {
                onChange((path) => {
                  delete path.widgets[index]
                })
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
