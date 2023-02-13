import { getLocationWidgets, getMapLocations, Widget } from "./index"
import { LocationStackView } from "./LocationWidget"
import { DragEventHandler, useEffect, useMemo, useRef, useState } from "react"
import LatLngLiteral = google.maps.LatLngLiteral
import LatLng = google.maps.LatLng
import PlaceResult = google.maps.places.PlaceResult
import { uuid } from "@automerge/automerge"
import { CreateWidgetDragData } from "../Path"

export interface PoiFinderWidget {
  id: string
  type: "poiFinder"
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
  const mapLocations = getMapLocations(widgetsInScope)

  const selectedLocation = mapLocations[0]

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
      async (results) => {
        if (!results) {
          return
        }

        const detailedResults = await Promise.all<PlaceResult | null>(
          results.map((result) => {
            const placeId = result.place_id

            if (!placeId) {
              return null
            }

            return new Promise((resolve) => {
              placesService.getDetails(
                {
                  placeId: placeId,
                  fields: [
                    "name",
                    "rating",
                    "photos",
                    "website",
                    "formatted_phone_number",
                    "formatted_address",
                    "geometry",
                  ],
                },
                (result) => {
                  resolve(result)
                }
              )
            })
          })
        )

        const pois: PoiResultWidget[] = detailedResults.flatMap(
          (detailedResult: PlaceResult | null) => {
            if (!detailedResult) {
              return []
            }

            const {
              name,
              rating,
              photos,
              website,
              formatted_phone_number,
              formatted_address,
              geometry,
            } = detailedResult

            if (!name || !geometry?.location) {
              return []
            }

            console.log(detailedResult, formatted_address)

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
          }
        )

        onChange((widget) => {
          widget.results = {
            latLng: new LatLng(selectedLocation.latLng).toJSON(), // convert to latlng first to remove automerge references
            pois,
          }
        })
      }
    )
  }, [selectedLocation.latLng.lat, selectedLocation.latLng.lng])

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl bg-white">
      <div className="flex p-2 items-center justify-between border-b border-gray-300">
        <div className="text-green-600 p-2">Campground Finder</div>

        <div className="flex gap-1"></div>
      </div>

      {widget.results && (
        <div className="bg-gray-100 flex-1 p-2 rounded-b-xl overflow-auto" style={{ minHeight: 0 }}>
          <div className=" flex flex-col gap-2">
            {widget.results.pois.map((poiWidget, index) => (
              <PoiResultWidgetListItemView widget={poiWidget} key={index} />
            ))}
          </div>
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
  const onDragStart: DragEventHandler<HTMLDivElement> = (evt) => {
    var bounds = (evt.target as HTMLDivElement).getBoundingClientRect()

    evt.dataTransfer.setData(
      "application/drag-data",
      JSON.stringify({
        type: "create",
        widget,
        width: 400,
        height: 400,
        offsetX: evt.clientX - bounds.left,
        offsetY: evt.clientY - bounds.top,
      } as CreateWidgetDragData)
    )

    evt.stopPropagation()
  }

  return (
    <div
      className="bg-gray-200 rounded-xl p-2 whitespace-nowrap overflow-hidden overflow-ellipsis flex justify-between"
      draggable
      onDragStart={onDragStart}
    >
      {widget.name} {widget.rating}
    </div>
  )
}

interface PoiResultWidgetViewProps {
  widget: PoiResultWidget
  widgetsInScope: Widget[]
}

export function PoiResultWidgetView({ widget, widgetsInScope }: PoiResultWidgetViewProps) {
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl overflow-hidden">
      <div className="flex p-2 items-center justify-between border-b border-gray-300">
        <div className="text-green-600 p-2">Place</div>
        <div className="flex gap-1"></div>
      </div>
      <div
        className="flex-1 overflow-auto p-4 bg-gray-100 rounded-b-xl flex flex-col gap-1"
        style={{ minHeight: 0 }}
      >
        <h1 className="font-bold text-xl">{widget.name}</h1>

        {widget.address && <p>{widget.address}</p>}
        {widget.website && <a href={widget.website}>{widget.website}</a>}
        {widget.phoneNumber && <a href={`tel:${widget.phoneNumber}`}>{widget.phoneNumber}</a>}

        <div className="h-[150px] flex gap-1 w-full overflow-auto">
          {widget.photos.map((photo, index) => (
            <img src={photo} className="h-full" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
