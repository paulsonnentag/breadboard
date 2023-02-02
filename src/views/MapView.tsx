import { EntityData } from "../db"
import { EntityViewProps, ViewType } from "./index"
import { useEffect, useRef } from "react"
import Map = google.maps.Map
import LatLngLiteral = google.maps.LatLngLiteral
import LatLng = google.maps.LatLng

export interface MapEntityProps {
  center: LatLngLiteral
  zoom?: number
}

function MapView({ entity }: EntityViewProps<MapEntityProps>) {
  const mapRef = useRef<Map>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentContainer = containerRef.current
    if (!currentContainer) {
      return
    }

    const currentMap = (mapRef.current = new google.maps.Map(currentContainer, {
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
    }
  }, [containerRef.current])

  return (
    <div
      className="flex-1"
      ref={containerRef}
      draggable
      onDragStart={(evt) => {
        evt.preventDefault()
        evt.stopPropagation()
      }}
    ></div>
  )
}

const viewDefinition: ViewType = {
  name: "Map",
  condition: (data: EntityData) => data.center,
  view: MapView,
}

export default viewDefinition
