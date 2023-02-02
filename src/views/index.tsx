import { createElement, FunctionComponent } from "react"
import { EntityData, EntityRef } from "../db"
import rawViewDef from "./RawView"
import mapViewDef from "./MapView"
import { Cross2Icon, DragHandleDots2Icon } from "@radix-ui/react-icons"

export interface EntityViewProps<T extends Partial<EntityData>> {
  entity: EntityRef<T>
}

export interface ViewType {
  name: string
  condition: (data: EntityData) => boolean
  view: FunctionComponent<EntityViewProps<Partial<EntityData>>>
}

const VIEW_TYPES: ViewType[] = [mapViewDef, rawViewDef]

function getSupportedViews(data: EntityData): ViewType[] {
  return VIEW_TYPES.filter((viewType) => viewType.condition(data))
}

export function WidgetView({ entity }: EntityViewProps<Partial<EntityData>>) {
  const supportedViews = getSupportedViews(entity.data)

  const view = supportedViews[0]

  return (
    <div className="border-b-gray-300 rounded bg-white shadow overflow-auto w-full h-full flex flex-col">
      <div className="bg-gray p-1 text-xs text-gray-500 flex gap-1 border-b border-color-gray-100">
        <DragHandleDots2Icon />

        {view.name}

        <div className="flex-1"></div>

        <button onClick={() => entity.destroy()}>
          <Cross2Icon />
        </button>
      </div>

      {createElement(view.view, { entity })}
    </div>
  )
}
