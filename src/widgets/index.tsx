import { MapWidgetView, MapWidget } from "./MapWidget"
import { WeatherWidgetView, WeatherWidget } from "./WeatherWidget"
import { LocationWidgetView, LocationWidget } from "./LocationWidget"

export type Widget = MapWidget | WeatherWidget | LocationWidget

interface WidgetViewProps {
  widget: Widget
  widgetsInScope: Widget[]
  onChange: (fn: (widget: any) => void) => void
}

export function WidgetView({ widget, onChange, widgetsInScope }: WidgetViewProps) {
  switch (widget.type) {
    case "weather":
      return <WeatherWidgetView widget={widget} onChange={onChange} />

    case "map":
      return <MapWidgetView widget={widget} widgetsInScope={widgetsInScope} onChange={onChange} />

    case "location":
      return <LocationWidgetView widget={widget} onChange={onChange} />
  }
}
