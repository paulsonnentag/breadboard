import { EntityData, EntityRef, UnknownEntityRef, useCreateEntity } from "../db"
import { EntityViewProps, ViewType, WidgetView } from "./index"
import { NearbyWidgetProp } from "../computations/closeWidgetsComputation"
import { isMap } from "./MapView"
import { useMemo, useState } from "react"
import PlaceResult = google.maps.places.PlaceResult
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral
import { registerViewType } from "./view-type-registry"

export interface CampgroundFinderEntityProps {
  type: "campgroundFinder"
  items?: EntityRef<PlaceResult>[]
}

function isCampgroundFinder(data: EntityData): data is CampgroundFinderEntityProps {
  return data.type === "campgroundFinder"
}

function CampgroundFinderView({
  entity,
}: EntityViewProps<CampgroundFinderEntityProps & NearbyWidgetProp>) {
  const createEntity = useCreateEntity()

  const availableBounds = entity.data.nearbyWidgets.filter(
    (widget) => isMap(widget.data) && widget.data.bounds
  )

  const placesService = useMemo(() => {
    // the api requires that you display copyright info, that's why we pass in this dummy div
    return new google.maps.places.PlacesService(document.createElement("div"))
  }, [])

  const searchCampgroundsInBounds = (bounds: LatLngBoundsLiteral) => {
    placesService.nearbySearch(
      {
        bounds: bounds,
        type: "campground",
      },
      (results) => {
        entity.data.items?.forEach((entity) => {
          console.log(entity)

          entity.destroy()
        })

        if (results) {
          const resultEntities = results.map((result) => {
            const data: any = {}

            if (result.name) {
              data.name = result.name
            }

            if (result.url) {
              data.url = result.url
            }

            if (result?.photos && result?.photos[0]) {
              data.thumbnail = result?.photos[0].getUrl({ maxHeight: 500, maxWidth: 500 })
            }

            if (result.rating) {
              data.rating = result.rating
            }

            if (result.geometry?.location) {
              data.latLng = result.geometry?.location?.toJSON()
            }

            return createEntity(data)
          })

          entity.replace("items", resultEntities)
        } else {
          entity.retract("items")
        }
      }
    )
  }

  return (
    <div className="p-2 flex flex-col gap-2">
      {availableBounds.map((entity) => (
        <button
          className="p-1 bg-gray-200"
          key={entity.id}
          onClick={() => {
            searchCampgroundsInBounds(entity.data.bounds)
          }}
        >
          search nearby
        </button>
      ))}

      <WidgetView entity={entity} view="List" />
    </div>
  )
}

registerViewType({
  name: "Campground finder",
  condition: isCampgroundFinder,
  view: CampgroundFinderView,
})
