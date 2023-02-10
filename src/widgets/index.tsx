import { MapWidgetView, MapWidget } from "./MapWidget"
import { WeatherWidgetView, WeatherWidget } from "./WeatherWidget"
import { LocationWidgetView, LocationWidget } from "./LocationWidget"
import {
  PoiFinderWidget,
  PoiFinderWidgetView,
  PoiResultWidget,
  PoiResultWidgetView,
} from "./PoiFinderWidget"
import { CalendarWidget } from "./CalendarWidget"
import LatLngLiteral = google.maps.LatLngLiteral

export type Widget =
  | MapWidget
  | WeatherWidget
  | LocationWidget
  | PoiFinderWidget
  | CalendarWidget
  | PoiResultWidget

interface WidgetViewProps {
  widget: Widget
  widgetsInScope: Widget[]
  onChange: (fn: (widget: any) => void) => void
}

export function WidgetView({ widget, onChange, widgetsInScope }: WidgetViewProps) {
  switch (widget.type) {
    case "weather":
      return (
        <WeatherWidgetView widget={widget} widgetsInScope={widgetsInScope} onChange={onChange} />
      )

    case "map":
      return <MapWidgetView widget={widget} widgetsInScope={widgetsInScope} onChange={onChange} />

    case "location":
      return <LocationWidgetView widget={widget} onChange={onChange} />

    case "poiFinder":
      return (
        <PoiFinderWidgetView widget={widget} onChange={onChange} widgetsInScope={widgetsInScope} />
      )

    case "poiResult":
      return <PoiResultWidgetView widget={widget} widgetsInScope={widgetsInScope} />

    default:
      return <span>not implemented {widget.type}</span>
  }
}

export function getLocationWidgets(widgets: Widget[]) {
  return widgets.flatMap(getLocationsOfWidget)
}

function getLocationsOfWidget(widget: Widget): LocationWidget[] {
  switch (widget.type) {
    case "map":
      return [widget.locationWidget]

    case "location":
      return [widget]

    default:
      return []
  }
}

interface WidgetOnMap {
  widget: Widget
  latLng: LatLngLiteral
}

export function getWidgetsOnMap(widgets: Widget[]): WidgetOnMap[] {
  return widgets.flatMap(getWidgetsOnMapOfWidget)
}

function getWidgetsOnMapOfWidget(widget: Widget): WidgetOnMap[] {
  switch (widget.type) {
    case "poiFinder":
      if (!widget.results) {
        return []
      }
      return widget.results.pois.flatMap(getWidgetsOnMapOfWidget)

    case "poiResult":
      return [
        {
          widget,
          latLng: widget.latLng,
        },
      ]

    default:
      return []
  }
}
