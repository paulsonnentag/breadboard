import { getLocationWidgets, Widget } from "./index"
import { LocationStackView } from "./LocationWidget"
import { useEffect, useMemo, useState } from "react"
import LatLngLiteral = google.maps.LatLngLiteral
import LatLng = google.maps.LatLng
import PlaceResult = google.maps.places.PlaceResult
import { uuid } from "@automerge/automerge"

export interface PoiFinderWidget {
  id: string
  type: "poiFinder"
  selectedLocationId: string
  results?: PoiResults
}

interface PoiResults {
  latLng: LatLngLiteral
  pois: PoiResultWidget[]
}

interface PoiFinderViewProps {
  widget: PoiFinderWidget
  onChange: (fn: (widget: PoiFinderWidget) => void) => void
  widgetsInScope: Widget[]
}

export function PoiFinderWidgetView({ widget, onChange, widgetsInScope }: PoiFinderViewProps) {
  const [search, setSearch] = useState("")
  const locationWidgets = getLocationWidgets(widgetsInScope)

  const selectedLocation =
    locationWidgets.find((location) => location.id === widget.selectedLocationId) ??
    locationWidgets[0]

  const placesService = useMemo(() => {
    // the api requires that you display copyright info, that's why we pass in this dummy div
    return new google.maps.places.PlacesService(document.createElement("div"))
  }, [])

  useEffect(() => {
    // don't refetch , if we already have stored result for the selectedLocation
    if (
      widget.results &&
      new LatLng(widget.results.latLng).equals(new LatLng(selectedLocation.latLng))
    ) {
      return
    }

    placesService.nearbySearch(
      {
        location: selectedLocation.latLng,
        radius: 50000,
        type: "campground",
      },
      (results) => {
        if (results) {
          const pois: PoiResultWidget[] = results.flatMap((result: PlaceResult) => {
            const {
              name,
              rating,
              photos,
              website,
              formatted_phone_number,
              formatted_address,
              geometry,
            } = result

            if (!name || !geometry?.location) {
              return []
            }

            const poi: PoiResultWidget = {
              id: uuid(),
              type: "poiResult",
              latLng: geometry.location.toJSON(),
              name,
              photos: photos ? photos.map((photo) => photo.getUrl()) : [],
            }

            if (rating) {
              poi.rating = rating
            }

            if (formatted_phone_number) {
              poi.phoneNumber = formatted_phone_number
            }

            if (website) {
              poi.website = website
            }

            if (formatted_address) {
              poi.address = formatted_address
            }

            return [poi]
          })

          console.log("fetch pois")

          onChange((widget) => {
            widget.results = {
              latLng: new LatLng(selectedLocation.latLng).toJSON(), // convert to latlng first to remove automerge references
              pois,
            }
          })
        }
      }
    )
  }, [selectedLocation.latLng.lat, selectedLocation.latLng.lng])

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex p-2 items-center justify-between border-b border-gray-300">
        <div className="text-green-600 p-2">Campground Finder</div>

        <div className="flex gap-1">
          <LocationStackView
            widgets={locationWidgets}
            selectedWidgetId={widget.selectedLocationId}
            onSelectWidgetId={(widgetId) => {
              onChange((widget) => (widget.selectedLocationId = widgetId))
            }}
          />
        </div>
      </div>

      {widget.results && (
        <div
          className="bg-gray-100 flex-1 p-2 rounded-b-xl flex flex-col gap-2"
          style={{ minHeight: 0 }}
        >
          {widget.results.pois.map((poiWidget, index) => (
            <PoiResultWidgetListItemView widget={poiWidget} key={index} />
          ))}
        </div>
      )}
    </div>
  )
}

export interface PoiResultWidget {
  id: string
  type: "poiResult"
  name: string
  rating?: number
  latLng: LatLngLiteral
  photos: string[]
  website?: string
  address?: string
  phoneNumber?: string
}

interface PoiResultWidgetListItemViewProps {
  widget: PoiResultWidget
}

function PoiResultWidgetListItemView({ widget }: PoiResultWidgetListItemViewProps) {
  return (
    <div className="bg-gray-200 rounded-xl p-2 whitespace-nowrap overflow-hidden overflow-ellipsis flex justify-between">
      {widget.name} {widget.rating}
    </div>
  )
}
