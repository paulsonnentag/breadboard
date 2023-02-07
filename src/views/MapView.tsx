import { EntityData } from "../db"
import { useEffect, useId, useRef } from "react"
import Map = google.maps.Map
import LatLngLiteral = google.maps.LatLngLiteral
import LatLng = google.maps.LatLng
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral
import GeoMarkersComputation, {
  GeoMarkersComputationProp,
} from "../computations/geoMarkersComputation"
import AdvancedMarkerView = google.maps.marker.AdvancedMarkerView
import { EntityViewProps, ViewType } from "./ViewType"
import MapsEventListener = google.maps.MapsEventListener
import { list } from "postcss"

export interface MapEntityProps {
  center: LatLngLiteral
  zoom?: number
  bounds?: LatLngBoundsLiteral
}

function MapView({ entity }: EntityViewProps<MapEntityProps & GeoMarkersComputationProp>) {
  const mapId = useId()
  const mapRef = useRef<Map>()
  const listenersRef = useRef<MapsEventListener[]>([])
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

    for (const markers of markersRef.current) {
      markers.map = currentMap
    }

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

      const listener = mapsMarker.addListener("click", () => {
        // emulate click event
        geoMarker.entity.replace("isClicked", true)

        setInterval(() => {
          geoMarker.entity.retract("isClicked")
        })
      })

      listenersRef.current.push(listener)

      mapsMarker.position = new LatLng(geoMarker.value)
      mapsMarker.zIndex = geoMarker.entity.data.isHovered ? 10 : 0
    }
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

const viewType: ViewType = {
  name: "Map",
  condition: isMap,
  view: MapView,
}

export default viewType
