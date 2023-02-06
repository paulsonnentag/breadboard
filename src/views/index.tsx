import { createElement } from "react"
import { EntityData } from "../db"

import "./MapView"
import "./PoiFinderView"
import "./NamedEntityView"
import "./ListView"
import "./ItemView"
import "./RawView"
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
    return <div>no supported view</div>
  }

  return createElement(selectedView.view, { entity })
}
