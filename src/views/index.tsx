import { Item, View } from "../store"
import { MapView, MapViewDefinition } from "./MapView"
import { WeatherView, WeatherViewDefinition } from "./WeatherView"

export interface ViewDefinition {
  name: string
  inputs: string[]

  displayName: string 
  color: string
}

export const ViewDefinitions = {
  [MapViewDefinition.name]: MapViewDefinition,
  [WeatherViewDefinition.name]: WeatherViewDefinition,
}


export type UpdateItemsFn = (fn: (items: Item[]) => void) => void

interface ViewFrameProps {
  view: View,
  items: Item[]
  updateItems: UpdateItemsFn
}

export function ViewFrame({ view, items, updateItems }: ViewFrameProps) {
  const viewDef = ViewDefinitions[view.name]

  return (
    <div
      className="rounded-xl shadow-xl bg-white overflow-hidden h-full flex flex-col"
    >
      <div
        className="p-4"
      >
        <span className={"font-bold "+viewDef.color}>
          {viewDef.displayName}
        </span>
      </div>
      <hr className="" />
      <ViewRenderer viewDef={viewDef} items={items} updateItems={updateItems} />
    </div>
  )
}


interface ViewRendererProps {
  viewDef: ViewDefinition,
  items: Item[]
  updateItems: UpdateItemsFn
}

export function ViewRenderer({ viewDef, items, updateItems }: ViewRendererProps) {
    switch (viewDef.name) {
      case "map":
        return (
          <MapView items={items} updateItems={updateItems} />
        )

      case "weather":
        return (
          <WeatherView items={items} updateItems={updateItems} />
        )
  
      default:
        return <span>not implemented {viewDef.name}</span>
    }
}


export interface ItemViewProps {
  items: Item[]
  updateItems: UpdateItemsFn
}