import { Widget } from "./index"
import LatLngLiteral = google.maps.LatLngLiteral
import { MapWidget } from "./MapWidget"

export interface LocationWidget {
  type: "location"
}

interface LocationWidgetViewProps {
  widget: LocationWidget
  onChange: (fn: (widget: LocationWidget) => void) => void
}

export function LocationWidgetView({ widget, onChange }: LocationWidgetViewProps) {
  return <div>location not implemented</div>
}
