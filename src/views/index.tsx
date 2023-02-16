import { Item, View } from "../store"
import { MapView, MapViewDefinition } from "./MapView"
import { WeatherView, WeatherViewDefinition } from "./WeatherView"
import { CalendarView, CalendarViewDefinition } from "./CalendarView"

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
}

export type UpdateItemsFn = (items: Item[]) => void

interface ViewFrameProps {
  view: View
  items: Item[]
  updateItems: UpdateItemsFn
}

export function ViewFrame({ view, items, updateItems }: ViewFrameProps) {
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
      <ViewRenderer viewDef={viewDef} items={items} updateItems={updateItems} />
    </div>
  )
}

interface ViewRendererProps {
  viewDef: ViewDefinition
  items: Item[]
  updateItems: UpdateItemsFn
}

export function ViewRenderer({ viewDef, items, updateItems }: ViewRendererProps) {
  switch (viewDef.name) {
    case "map":
      return <MapView items={items} updateItems={updateItems} />

    case "weather":
      return <WeatherView items={items} updateItems={updateItems} />

    case "calendar":
      return <CalendarView items={items} updateItems={updateItems} />

    default:
      return <span>not implemented {viewDef.name}</span>
  }
}

export interface ItemViewProps {
  items: Item[]
  updateItems: UpdateItemsFn
}
