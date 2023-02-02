import { EntityData } from "../db"
import { EntityViewProps, ViewType } from "./index"
import { useEffect, useRef } from "react"
import Map = google.maps.Map
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral
import LatLngBounds = google.maps.LatLngBounds

interface MapViewEntity {
  bounds: LatLngBoundsLiteral
}

function MapView({ entity }: EntityViewProps<MapViewEntity>) {
  const mapRef = useRef<Map>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentContainer = containerRef.current
    if (!currentContainer) {
      return
    }

    const bounds = new LatLngBounds(entity.data.bounds)

    const currentMap = (mapRef.current = new google.maps.Map(currentContainer, {
      center: bounds.getCenter(),
      zoom: 11,
      streetView: null,
      fullscreenControl: false,
      streetViewControl: false,
      scaleControl: false,
      zoomControl: false,
      mapTypeControl: false,
    }))

    currentMap.fitBounds(bounds)

    /*const onChangeBounds = () => {
      const newBounds = currentMap.getBounds()

      if (newBounds) {
        entity.replace("bounds", newBounds.toJSON())
      }
    }

    const centerChangedListener = currentMap.addListener("center_changed", onChangeBounds)
    const zoomChangedListener = currentMap.addListener("zoom_changed", onChangeBounds)

    return () => {
      centerChangedListener.remove()
      zoomChangedListener.remove()
    }


     */
  }, [containerRef.current])

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

const viewDefinition: ViewType = {
  name: "Map",
  condition: (data: EntityData) => data.bounds,
  view: MapView,
}

export default viewDefinition
