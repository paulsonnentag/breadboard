import { MapWidgetView, MapWidget, MapLocation } from "./MapWidget"
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
import { uniqBy } from "lodash"
import { PathWidget, PathWidgetView } from "./PathWidget"

export type Widget =
  | PathWidget
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

export function WidgetView({ widget, widgetsInScope, onChange }: WidgetViewProps) {
  switch (widget.type) {
    /* case "weather":
      return (
        <WeatherWidgetView widget={widget} widgetsInScope={widgetsInScope} onChange={onChange} />
      ) */

    case "map":
      return <MapWidgetView widget={widget} widgetsInScope={widgetsInScope} onChange={onChange} />

    /*
    case "location":
      return <LocationWidgetView widget={widget} onChange={onChange} />

    case "poiFinder":
      return (
        <PoiFinderWidgetView widget={widget} onChange={onChange} widgetsInScope={widgetsInScope} />
      )

    case "poiResult":
      return <PoiResultWidgetView widget={widget} widgetsInScope={widgetsInScope} /> */

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
