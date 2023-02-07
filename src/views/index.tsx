import { createElement } from "react"
import { EntityData } from "../db"

import mapViewDef from "./MapView"
import poiFinderViewDef from "./PoiFinderView"
import nameEntityViewDef from "./NamedEntityView"
import listViewDef from "./ListView"
import itemViewDef from "./ItemView"
import rawViewDef from "./RawView"
import weatherViewDef from "./WeatherView"
import { getSupportedViews, setViewTypes } from "./view-type-registry"
import { EntityViewProps } from "./ViewType"

setViewTypes([
  mapViewDef,
  poiFinderViewDef,
  weatherViewDef,
  nameEntityViewDef,
  listViewDef,
  itemViewDef,
  rawViewDef,
])

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
