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
import { uniqBy } from "lodash"
import { useWidget } from "../store"
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
  id: string
}

export function WidgetView({ id }: WidgetViewProps) {
  const widget = useWidget(id)

  switch (widget.type) {
    /* case "weather":
      return (
        <WeatherWidgetView widget={widget} widgetsInScope={widgetsInScope} onChange={onChange} />
      ) */

    case "path":
      return <PathWidgetView widget={widget} />

    case "map":
      return <MapWidgetView widget={widget} />

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

export function getLocationWidgets(widgets: Widget[]) {
  // hack filter uniqueness to eliminate duplicates, for example when poiresult is multiple times on board
  return uniqBy(widgets.flatMap(getLocationsOfWidget), (w: Widget) => w.id)
}

function getLocationsOfWidget(widget: Widget): LocationWidget[] {
  switch (widget.type) {
    case "map":
      return [widget.locationWidget]

    case "location":
      return [widget]

    case "poiFinder":
      return widget.results ? widget.results.pois.flatMap(getLocationsOfWidget) : []

    case "poiResult":
      return [
        {
          id: widget.id,
          type: "location",
          name: widget.name,
          latLng: widget.latLng,
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
