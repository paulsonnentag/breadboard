import { Widget } from "./index"
import LatLngLiteral = google.maps.LatLngLiteral
import Map = google.maps.Map
import { useEffect, useId, useRef } from "react"
import LatLng = google.maps.LatLng
import AdvancedMarkerView = google.maps.marker.AdvancedMarkerView
import { LocationContextView, LocationWidget, LocationWidgetView } from "./LocationWidget"

export interface MapWidget {
  type: "map"
  locationWidget: LocationWidget
}

interface MapWidgetViewProps {
  widget: MapWidget
  widgetsInScope: Widget[]
  onChange: (fn: (widget: MapWidget) => void) => void
}

export function MapWidgetView({ widget, onChange, widgetsInScope }: MapWidgetViewProps) {
  const mapId = useId()
  const mapRef = useRef<Map>()
  const markersRef = useRef<AdvancedMarkerView[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentContainer = containerRef.current
    if (!currentContainer) {
      return
    }

    const currentMap = (mapRef.current = new google.maps.Map(currentContainer, {
      mapId,

      zoom: 11,
      center: widget.locationWidget.latLng,

      // disable additional ui controls
      streetView: null,
      fullscreenControl: false,
      streetViewControl: false,
      scaleControl: false,
      zoomControl: false,
      mapTypeControl: false,

      // allow to zoom map on scroll without pressing command
      gestureHandling: "greedy",
    }))

    for (const markers of markersRef.current) {
      markers.map = currentMap
    }

    /*
    const boundsChangedListener = currentMap.addListener("bounds_changed", () => {
      const bounds = currentMap.getBounds()
      if (bounds) {
        entity.replace("bounds", bounds.toJSON())
      }
    })

    const centerChangedListener = currentMap.addListener("center_changed", () => {
      const center = currentMap.getCenter()
      if (center) {
        entity.replace("center", center.toJSON())
      }
    })

    const zoomChangedListener = currentMap.addListener("zoom_changed", () => {
      const zoom = currentMap.getZoom()
      if (zoom !== undefined) {
        entity.replace("zoom", zoom)
      }
    })

    return () => {
      centerChangedListener.remove()
      zoomChangedListener.remove()
      boundsChangedListener.remove()
    }


     */
  }, [containerRef.current])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(widget.locationWidget.latLng)
    }
  }, [widget.locationWidget.latLng])

  /*

  useEffect(() => {
    if (!mapRef.current) {
      return
    }

    const geoMarkers = entity.data.geoMarkers

    const markersToDelete = markersRef.current.slice(geoMarkers.length)
    const prevMarkers = (markersRef.current = markersRef.current.slice(0, geoMarkers.length))

    listenersRef.current.forEach((listener) => {
      listener.remove()
    })
    listenersRef.current = []

    markersToDelete.forEach((marker: AdvancedMarkerView) => {
      marker.map = null
    })

    for (let i = 0; i < geoMarkers.length; i++) {
      const geoMarker = geoMarkers[i]
      let mapsMarker = prevMarkers[i] // reuse existing markers, if it already exists

      if (!mapsMarker) {
        const element = document.createElement("div")

        mapsMarker = new AdvancedMarkerView({
          map: mapRef.current,
          content: element,
          position: new LatLng(geoMarker.value),
        })

        prevMarkers.push(mapsMarker)
      }

      const markerContent = mapsMarker.content as HTMLDivElement

      markerContent.className = `w-[16px] h-[16px] rounded-full shadow cursor-pointer ${
        geoMarker.entity.data.isHovered ? "bg-red-500" : "bg-blue-500"
      }`


      markerContent.onmouseenter = () => {
        geoMarker.entity.replace("isHovered", true)
      }
      markerContent.onmouseleave = () => {
        geoMarker.entity.retract("isHovered")
      }



      mapsMarker.position = new LatLng(geoMarker.value)
      mapsMarker.zIndex = geoMarker.entity.data.isHovered ? 10 : 0
    }
  }, [entity.data.geoMarkers, mapRef.current])
  */

  const contextWidgets = widget.locationWidget
    ? widgetsInScope
    : widgetsInScope.concat(widget.locationWidget)

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex p-2 items-center justify-between">
        <div className="text-green-600 p-2">Map</div>

        <LocationContextView
          widget={widget.locationWidget}
          onChange={(fn) => onChange((widget) => fn(widget.locationWidget))}
        />
      </div>

      <div
        className="flex-1"
        ref={containerRef}
        draggable
        onDragStart={(evt) => {
          evt.preventDefault()
          evt.stopPropagation()
        }}
      ></div>
    </div>
  )
}
