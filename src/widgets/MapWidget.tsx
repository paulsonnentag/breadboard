import { Widget } from "./index"
import LatLngLiteral = google.maps.LatLngLiteral

export interface MapWidget {
  type: "map"
  includedWidgets: Widget[]
}

interface MapWidgetViewProps {
  widget: MapWidget
  onChange: (fn: (widget: MapWidget) => void) => void
}

export function MapWidgetView({ widget, onChange }: MapWidgetViewProps) {
  return <div>map not implemented</div>
}
