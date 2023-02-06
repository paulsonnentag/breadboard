import { createElement, FunctionComponent } from "react"
import { EntityData, EntityRef } from "../db"

import "./MapView"
import "./CampgroundFinderView"
import "./NamedEntityView"
import "./ListView"
import "./RawView"

import { Cross2Icon, DragHandleDots2Icon } from "@radix-ui/react-icons"
import { EntityViewProps, getSupportedViews } from "./view-type-registry"

interface WidgetViewProps extends EntityViewProps<Partial<EntityData>> {
  view?: string
}

export function WidgetView({ entity, view }: WidgetViewProps) {
  const supportedViews = getSupportedViews(entity.data)

  const selectedView = view
    ? supportedViews.find((supportedView) => supportedView.name === view)
    : supportedViews[0]

  if (!selectedView) {
    return <div>"no supported view"</div>
  }

  const onMouseEnter = () => {
    entity.replace("isHovered", true)
  }

  const onMouseLeave = () => {
    entity.retract("isHovered")
  }

  return (
    <div
      className="border-b-gray-300 rounded bg-white shadow overflow-auto w-full h-full flex flex-col"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-gray p-1 text-xs text-gray-500 flex gap-1 border-b border-color-gray-100">
        <DragHandleDots2Icon />

        {selectedView.name}

        <div className="flex-1"></div>

        <button onClick={() => entity.destroy()}>
          <Cross2Icon />
        </button>
      </div>

      <div className="flex-1 overflow-auto">{createElement(selectedView.view, { entity })}</div>
    </div>
  )
}
