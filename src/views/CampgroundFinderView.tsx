import { EntityData, UnknownEntityRef } from "../db"
import { EntityViewProps, ViewType } from "./index"
import { NearbyWidgetProp } from "../computations/closeWidgetsComputation"
import { isMap } from "./MapView"
import { useMemo, useState } from "react"
import PlaceResult = google.maps.places.PlaceResult
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral

export interface CampgroundFinderEntityProps {
  type: "campgroundFinder"
  results?: PlaceResult[]
}

function isCampgroundFinder(data: EntityData): data is CampgroundFinderEntityProps {
  return data.type === "campgroundFinder"
}

function CampgroundFinderView({
  entity,
}: EntityViewProps<CampgroundFinderEntityProps & NearbyWidgetProp>) {
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
        if (results) {
          entity.replace("results", JSON.parse(JSON.stringify(results)))
        } else {
          entity.retract("results")
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

      {availableBounds.length === 0 && "place me near a map"}

      {entity.data.results &&
        entity.data.results.map((result, index) => (
          <div className="flex flex gap-2" key={index}>
            <div>
              <div key={index}>
                {result.url ? <a href={result.url}>{result.name}</a> : result.name}
              </div>
              <div>{result.rating}</div>
            </div>
          </div>
        ))}
    </div>
  )
}

const viewDefition: ViewType = {
  name: "Campground finder",
  condition: isCampgroundFinder,
  view: CampgroundFinderView,
}

export default viewDefition
