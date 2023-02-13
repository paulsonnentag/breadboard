import { LocationOverride, LocationPickerView, LocationWidget } from "./LocationWidget"
import { getWidgetsOnMap, Widget, WidgetView } from "./index"
import { useEffect, useId, useMemo, useRef, useState } from "react"

export interface PathWidget {
  id: string
  type: "path"
  widgetIds: string[]
}

interface PathWidgetViewProps {
  widget: PathWidget
}

export function PathWidgetView({ widget }: PathWidgetViewProps) {
  return (
    <div className="flex">
      <h1>Path</h1>

      {widget.widgetIds.map((widgetId, index) => (
        <WidgetView id={widgetId} key={index} />
      ))}
    </div>
  )
}
