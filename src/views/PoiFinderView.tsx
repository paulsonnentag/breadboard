import { EntityData, EntityRef, UnknownEntityRef, useCreateEntity } from "../db"
import { NearbyWidgetProp } from "../computations/nearbyWidgetsComputation"
import { isMap } from "./MapView"
import { useMemo } from "react"
import { Option, Select } from "../Select"
import { ListEntityProps, ListView } from "./ListView"
import { EntityViewProps, ViewType } from "./ViewType"
import PlaceResult = google.maps.places.PlaceResult
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral

export interface PoiFinderEntityProps {
  type: "poiFinder"
  placeType: string
  items?: EntityRef<PlaceResult>[]
}

function isPoiFinder(data: EntityData): data is PoiFinderEntityProps {
  return data.type === "poiFinder"
}

const POI_TYPE_OPTIONS: Option<string>[] = [
  { value: "gas_station", name: "Gas station" },
  { value: "campground", name: "Campground" },
  { value: "tourist_attraction", name: "Tourist attraction" },
]

function PoiFinderView({ entity }: EntityViewProps<PoiFinderEntityProps & NearbyWidgetProp>) {
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
        type: entity.data.placeType,
      },
      (results) => {
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

  const selectedOption = POI_TYPE_OPTIONS.find((option) => option.value === entity.data.placeType)

  return (
    <div className="p-2 flex flex-col gap-2 overflow-auto h-full">
      <Select
        selectedOption={selectedOption}
        options={POI_TYPE_OPTIONS}
        onChange={(option) => {
          if (option) {
            entity.replace("placeType", option.value)
            entity.replace("items", [])
          }
        }}
      />

      {availableBounds.map((entity: UnknownEntityRef) => (
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

      <div className="flex-1 overflow-auto flex-shrink" style={{ minHeight: 0 }}>
        <ListView entity={entity as any} allowDrop={false} />
      </div>
    </div>
  )
}

const viewType: ViewType = {
  name: "POI finder",
  condition: isPoiFinder,
  view: PoiFinderView,
}
export default viewType
