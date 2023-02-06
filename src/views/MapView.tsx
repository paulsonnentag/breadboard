import { EntityData } from "../db"
import { EntityViewProps, ViewType } from "./index"
import { useEffect, useId, useRef } from "react"
import Map = google.maps.Map
import LatLngLiteral = google.maps.LatLngLiteral
import LatLng = google.maps.LatLng
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral
import { registerViewType } from "./view-type-registry"
import GeoMarkersComputation, {
  GeoMarkersComputationProp,
} from "../computations/geoMarkersComputation"
import AdvancedMarkerView = google.maps.marker.AdvancedMarkerView

export interface MapEntityProps {
  center: LatLngLiteral
  zoom?: number
  bounds?: LatLngBoundsLiteral
}

function MapView({ entity }: EntityViewProps<MapEntityProps & GeoMarkersComputationProp>) {
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
      center: new LatLng(entity.data.center),
      zoom: entity.data.zoom ?? 11,

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
  }, [containerRef.current])

  useEffect(() => {
    if (!mapRef.current) {
      return
    }

    markersRef.current.forEach((marker: AdvancedMarkerView) => {
      marker.map = null
    })

    markersRef.current = []

    for (const geoMarker of entity.data.geoMarkers) {
      const markerElement = document.createElement("div")
      markerElement.className = `w-[16px] h-[16px] rounded-full shadow ${
        geoMarker.entity.data.isHovered ? "bg-red-500" : "bg-blue-500"
      }`

      markersRef.current.push(
        new AdvancedMarkerView({
          map: mapRef.current,
          position: geoMarker.value,
          content: markerElement,
        })
      )
    }

    console.log("add markers")
  }, [entity.data.geoMarkers, mapRef.current])

  return (
    <div
      className="w-full h-full"
      ref={containerRef}
      draggable
      onDragStart={(evt) => {
        evt.preventDefault()
        evt.stopPropagation()
      }}
    ></div>
  )
}

export function isMap(data: EntityData): data is MapEntityProps {
  return data.center !== undefined
}

registerViewType({
  name: "Map",
  condition: isMap,
  view: MapView,
})
