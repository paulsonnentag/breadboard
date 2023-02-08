import { MapWidget } from "./MapWidget"
import { Widget } from "./index"

export interface WeatherWidget {
  type: "weather"
}

interface WeatherWidgetViewProps {
  widget: WeatherWidget
  onChange: (fn: (widget: WeatherWidget) => void) => void
}

export function WeatherWidgetView({ widget, onChange }: WeatherWidgetViewProps) {
  return <div>weather not implemented</div>
}
