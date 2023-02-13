import { useEffect, useId, useMemo, useRef, useState } from "react"
import { LocationOverride, LocationWidget } from "./LocationWidget"
import Map = google.maps.Map
import LatLng = google.maps.LatLng
import AdvancedMarkerView = google.maps.marker.AdvancedMarkerView
import LatLngBounds = google.maps.LatLngBounds
import GeocoderResult = google.maps.GeocoderResult
import MapsEventListener = google.maps.MapsEventListener
import { debounce } from "lodash"

export interface MapWidget {
  id: string
  type: "map"
}

interface MapWidgetViewProps {
  widget: MapWidget
}

export function MapWidgetView({ widget }: MapWidgetViewProps) {
  const mapId = useId()
  const mapRef = useRef<Map>()
  const listenersRef = useRef<MapsEventListener[]>([])
  const markersRef = useRef<AdvancedMarkerView[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentOverride, setCurrentOverride] = useState<LocationOverride>()
  const geoCoder = useMemo(() => new google.maps.Geocoder(), [])

  // init map

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

    const onChangeMapView = debounce(() => {
      const center = currentMap.getCenter()

      if (center && !center.equals(new LatLng(widget.locationWidget.latLng))) {
        geoCoder.geocode({ location: center }, (results) => {
          const mapBounds = currentMap.getBounds()

          if (!results || !mapBounds) {
            return
          }

          let biggestContainedResult = getBiggestContainedResult(mapBounds, results)

          setCurrentOverride({
            name: biggestContainedResult.formatted_address,
            latLng: center.toJSON(),
          })
        })
      }
    }, 500)

    const centerChangedListener = currentMap.addListener("center_changed", onChangeMapView)
    const boundsChangedListener = currentMap.addListener("bounds_changed", onChangeMapView)
    const zoomChangedListener = currentMap.addListener("zoom_changed", onChangeMapView)

    return () => {
      centerChangedListener.remove()
      zoomChangedListener.remove()
      boundsChangedListener.remove()
    }
  }, [containerRef.current])

  // update markers

  /*
  useEffect(() => {
    if (!mapRef.current) {
      return
    }

    const markersToDelete = markersRef.current.slice(widgetsOnMap.length)
    const prevMarkers = (markersRef.current = markersRef.current.slice(0, widgetsOnMap.length))

    listenersRef.current.forEach((listener) => {
      listener.remove()
    })
    listenersRef.current = []

    markersToDelete.forEach((marker: AdvancedMarkerView) => {
      marker.map = null
    })

    for (let i = 0; i < widgetsOnMap.length; i++) {
      const geoMarker = widgetsOnMap[i]
      let mapsMarker = prevMarkers[i] // reuse existing markers, if it already exists

      if (!mapsMarker) {
        const element = document.createElement("div")

        mapsMarker = new AdvancedMarkerView({
          map: mapRef.current,
          content: element,
          position: new LatLng(geoMarker.latLng),
        })

        prevMarkers.push(mapsMarker)
      }

      const markerContent = mapsMarker.content as HTMLDivElement

      markerContent.className = `w-[16px] h-[16px] rounded-full shadow cursor-pointer bg-red-500`


      markerContent.className = `w-[16px] h-[16px] rounded-full shadow cursor-pointer ${
        geoMarker.entity.data.isHovered ? "bg-red-500" : "bg-blue-500"
      }`


      markerContent.onmouseenter = () => {
        geoMarker.entity.replace("isHovered", true)
      }
      markerContent.onmouseleave = () => {
        geoMarker.entity.retract("isHovered")
      }



      mapsMarker.position = new LatLng(geoMarker.latLng)

      // mapsMarker.zIndex = geoMarker.entity.data.isHovered ? 10 : 0
    }
  }, [widgetsOnMap, mapRef.current])
*/

  useEffect(() => {
    if (
      mapRef.current &&
      !currentOverride &&
      !mapRef.current?.getCenter()?.equals(new LatLng(widget.locationWidget.latLng))
    ) {
      mapRef.current.setCenter(widget.locationWidget.latLng)
    }
  }, [widget.locationWidget.latLng, currentOverride])

  return (
    <div className="flex flex-col w-full h-full">
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

function getBiggestContainedResult(
  bounds: LatLngBounds,
  results: GeocoderResult[]
): GeocoderResult {
  for (const result of results) {
    if (!result.geometry.bounds) {
      continue
    }

    if (
      !bounds.contains(result.geometry.bounds.getNorthEast()) ||
      !bounds.contains(result.geometry.bounds.getSouthWest())
    ) {
      return result
    }
  }

  return results[0]
}
