import { Item, Path, View } from "../store"
import { MapView, MapViewDefinition } from "./MapView"
import { WeatherView, WeatherViewDefinition } from "./WeatherView"
import { CalendarView, CalendarViewDefinition } from "./CalendarView"
import { PoiFinderView, PoiFinderViewDefinition } from "./PoiFinderView";
import { PoiResultView, PoiResultViewDefinition } from "./PoiResultView";

export interface ViewDefinition {
  name: string
  inputs: string[]

  displayName: string
  color: string
  icon: string
}

export const ViewDefinitions = {
  [MapViewDefinition.name]: MapViewDefinition,
  [WeatherViewDefinition.name]: WeatherViewDefinition,
  [CalendarViewDefinition.name]: CalendarViewDefinition,
  [PoiFinderViewDefinition.name]: PoiFinderViewDefinition,
  [PoiResultViewDefinition.name]: PoiResultViewDefinition
}

export type UpdateItemsFn = (items: Item[]) => void

interface ViewFrameProps {
  view: View
  items: Item[]
  updateItems: UpdateItemsFn
  onCreateNewPath: (path: Path) => void
}

export function ViewFrame({ view, items, updateItems, onCreateNewPath }: ViewFrameProps) {
  const viewDef = ViewDefinitions[view.name]

  return (
    <div className="rounded-xl shadow-xl bg-white overflow-hidden h-full flex flex-col" >
      <div className="p-4">
        <p className={"font-bold " + viewDef.color}>
          <span className="material-symbols-rounded text-base font-normal mr-1">
            {viewDef.icon}
          </span>
          {viewDef.displayName}
        </p>
      </div>
      <hr className="" />
      <ViewRenderer viewDef={viewDef} items={items} updateItems={updateItems}  onCreateNewPath={onCreateNewPath}  />
    </div>
  )
}

interface ViewRendererProps {
  viewDef: ViewDefinition
  items: Item[]
  updateItems: UpdateItemsFn
  onCreateNewPath: (path: Path) => void
}

export function ViewRenderer({ viewDef, items, updateItems, onCreateNewPath }: ViewRendererProps) {
  switch (viewDef.name) {
    case "map":
      return <MapView items={items} updateItems={updateItems} onCreateNewPath={onCreateNewPath}  />

    case "weather":
      return <WeatherView items={items} updateItems={updateItems} onCreateNewPath={onCreateNewPath}  />

    case "calendar":
      return <CalendarView items={items} updateItems={updateItems}  onCreateNewPath={onCreateNewPath} />

    case "poiFinder":
      return <PoiFinderView items={items} updateItems={updateItems} onCreateNewPath={onCreateNewPath} />

    case "poiResult":
      return <PoiResultView items={items} updateItems={updateItems} onCreateNewPath={onCreateNewPath}/>

    default:
      return <span>not implemented {viewDef.name}</span>
  }
}

export interface ItemViewProps {
  items: Item[]
  updateItems: UpdateItemsFn
  onCreateNewPath: (path: Path) => void
}
