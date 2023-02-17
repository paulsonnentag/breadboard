import { ItemViewProps, ViewDefinition } from "."
import { Item } from "../store"
import { useEffect, useId, useMemo, useRef } from "react"
import { debounce } from "lodash"
import Map = google.maps.Map
import LatLng = google.maps.LatLng
import LatLngBounds = google.maps.LatLngBounds
import GeocoderResult = google.maps.GeocoderResult
import { LocationItem } from "../items/LocationItem"
import MapsEventListener = google.maps.MapsEventListener;
import AdvancedMarkerView = google.maps.marker.AdvancedMarkerView;
import { PoiResultItemSet } from "../items/PoiResultItemSet";


export const MapViewDefinition: ViewDefinition = {
  name: "map",
  inputs: ["geolocation"], // not declaring the poiResultSet here, because we only want to passively observe it if its there
  displayName: "Map",
  color: "text-green-700",
  icon: "map",
}

export const MapView = ({ items, updateItems }: ItemViewProps) => {
  let locationValue = {
    lat: 39.7392,
    lng: -104.9903,
  }

  let locationItem = items.find((i) => i.type == "geolocation")
  let locationItemValue: LocationItem = locationItem?.value
  if (locationItemValue && locationItemValue.lat && locationItemValue.long) {
    locationValue.lat = locationItemValue.lat
    locationValue.lng = locationItemValue.long
  }

  // this should be done by a transform/provider the map widget shouldn't need to know about pois
  const poiResultSet = items.find(({type}) => type === "poiResultSet")

  const listenersRef = useRef<MapsEventListener[]>([])
  const markersRef = useRef<AdvancedMarkerView[]>([])
  const mapId = useId()
  const mapRef = useRef<Map>()
  const containerRef = useRef<HTMLDivElement>(null)
  const geoCoder = useMemo(() => new google.maps.Geocoder(), [])

  useEffect(() => {
    const currentContainer = containerRef.current
    if (!currentContainer) {
      return
    }

    if (!locationValue.lat || !locationValue.lng) {
      return
    }

    const currentMap = (mapRef.current = new google.maps.Map(currentContainer, {
      mapId,

      zoom: 11,
      center: locationValue,

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

    // TODO:
    // for (const markers of markersRef.current) {
    //   markers.map = currentMap
    // }


    const onChangeMapView = debounce(() => {
      const center = currentMap.getCenter()

      if (center && !center.equals(new LatLng(locationValue))) {
        geoCoder.geocode({ location: center }, (results) => {
          const mapBounds = currentMap.getBounds()

          if (!results || !mapBounds) {
            return
          }

          let biggestContainedResult = getBiggestContainedResult(mapBounds, results)

          if (locationItem) {
            const newItemValue: LocationItem = {
              lat: center.lat(),
              long: center.lng(),
              title: biggestContainedResult.formatted_address
            }

            locationItem.value = newItemValue

            updateItems([locationItem])
          }
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


  useEffect(() => {
    if (!mapRef.current) {
      return
    }


    const results = poiResultSet?.value?.results


    const totalMarkers = results ? results.length : 0

    // cleanup unused markers and event listener


    const markersToDelete = markersRef.current.slice(totalMarkers)

    listenersRef.current.forEach((listener) => {
      listener.remove()
    })
    listenersRef.current = []

    markersToDelete.forEach((marker: AdvancedMarkerView) => {
      marker.map = null
    })

    const prevMarkers = (markersRef.current = markersRef.current.slice(0, totalMarkers))


    // update / create new markers

    if (!results) {
      return
    }

    for (let i = 0; i < results.length; i++) {
      const poiResult : PoiResultItemSet = results[i]
      let mapsMarker = prevMarkers[i] // reuse existing markers, if it already exists

      if (!mapsMarker) {
        const element = document.createElement("div")

        mapsMarker = new AdvancedMarkerView({
          map: mapRef.current,
          content: element,
          position: new LatLng(poiResult.latLng),
        })

        prevMarkers.push(mapsMarker)
      }

      const markerContent = mapsMarker.content as HTMLDivElement

      markerContent.className = `w-[16px] h-[16px] rounded-full shadow cursor-pointer bg-red-500`

      /*
      markerContent.className = `w-[16px] h-[16px] rounded-full shadow cursor-pointer ${
        geoMarker.entity.data.isHovered ? "bg-red-500" : "bg-blue-500"
      }`
      markerContent.onmouseenter = () => {
        geoMarker.entity.replace("isHovered", true)
      }
      markerContent.onmouseleave = () => {
        geoMarker.entity.retract("isHovered")
      }
       */

      console.log("update", poiResult.latLng)

      mapsMarker.position = new LatLng(poiResult.latLng)

      // mapsMarker.zIndex = geoMarker.entity.data.isHovered ? 10 : 0
    }
  }, [poiResultSet, mapRef.current])

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