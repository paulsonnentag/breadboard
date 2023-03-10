import { MapWidgetView, MapWidget, MapLocation } from "./MapWidget"
import { WeatherWidgetView, WeatherWidget } from "./WeatherWidget"
import {
  PoiFinderWidget,
  PoiFinderWidgetView,
  PoiResultWidget,
  PoiResultWidgetView,
} from "./PoiFinderWidget"
import { CalendarWidget } from "./CalendarWidget"
import LatLngLiteral = google.maps.LatLngLiteral
import { uniqBy } from "lodash"

export type Widget = MapWidget | WeatherWidget | PoiFinderWidget | CalendarWidget | PoiResultWidget

interface WidgetViewProps {
  widget: Widget
  widgetsInScope: Widget[]
  onChange: (fn: (widget: any) => void) => void
  onDestroy: () => void
}

export function WidgetView({ widget, widgetsInScope, onChange, onDestroy }: WidgetViewProps) {
  switch (widget.type) {
    case "weather":
      return (
        <WeatherWidgetView
          widget={widget}
          widgetsInScope={widgetsInScope}
          onChange={onChange}
          onDestroy={onDestroy}
        />
      )

    case "map":
      return (
        <MapWidgetView
          widget={widget}
          widgetsInScope={widgetsInScope}
          onChange={onChange}
          onDestroy={onDestroy}
        />
      )

    case "poiFinder":
      return (
        <PoiFinderWidgetView
          widget={widget}
          onChange={onChange}
          widgetsInScope={widgetsInScope}
          onDestroy={onDestroy}
        />
      )

    case "poiResult":
      return (
        <PoiResultWidgetView
          widget={widget}
          widgetsInScope={widgetsInScope}
          onDestroy={onDestroy}
        />
      )

    default:
      return <span>not implemented {widget.type}</span>
  }
}

export function getMapLocations(widgets: Widget[]) {
  return widgets.flatMap(getMapLocationsOfWidget)
}

function getMapLocationsOfWidget(widget: Widget): MapLocation[] {
  switch (widget.type) {
    case "map":
      return [widget.location]

    case "location":
      return [widget]

    case "poiFinder":
      return widget.results ? widget.results.pois.flatMap(getMapLocationsOfWidget) : []

    case "poiResult":
      return [
        {
          name: widget.name,
          latLng: widget.latLng,
          widget: widget,
        },
      ]

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
