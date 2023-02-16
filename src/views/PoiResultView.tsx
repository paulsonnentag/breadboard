import { ItemViewProps, ViewDefinition } from "./index"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { PoiResultItem } from "../items/PoiResultItem"
import { useEffect } from "react"
import { LocationItem } from "../items/LocationItem"
import { getTime } from "date-fns"
import { Item } from "../store"

export const PoiResultViewDefinition: ViewDefinition = {
  name: "poiResult",
  inputs: ["poiResultItem", "geolocation"],
  displayName: "Campgrounds",
  color: "text-lime-500",
  icon: "distance",
}

// The proper model would only cause views to receive items they've listed as inputs; for now we are simply passing all the path's data items.
export const PoiResultView = ({ items, updateItems }: ItemViewProps) => {
  let poiResultItem = items.find((i) => i.type === "poiResult")!.value as PoiResultItem
  let locationItem = items.find((i) => i.type === "geolocation")?.value as LocationItem



  // this should be done by a transformer
  useEffect(() => {


    if (
      locationItem && (
        locationItem.lat !== poiResultItem.latLng.lat ||
        locationItem.long !== poiResultItem.latLng.lng
      )
    ) {



      const locationItem = items.find((i) => i.type === "geolocation")
      if (locationItem) {
        const newLocationItem = {
          ...locationItem,
          value: {
            lat: poiResultItem.latLng.lat,
            long: poiResultItem.latLng.lng,
            title: poiResultItem.address
          },
        }

        console.log("set new location", newLocationItem)

        updateItems([newLocationItem])
      } else {
        console.log("could not find location")
      }
    }
  }, [locationItem?.lat, locationItem?.long, updateItems])

  return (
    <div
      className="flex-1 overflow-auto p-4 bg-gray-100  flex flex-col gap-1"
      style={{ minHeight: 0 }}
    >
      <h1 className="font-bold text-xl">{poiResultItem.name}</h1>

      {poiResultItem.address && <p>{poiResultItem.address}</p>}
      {poiResultItem.website && <a href={poiResultItem.website}>{poiResultItem.website}</a>}
      {poiResultItem.phoneNumber && (
        <a href={`tel:${poiResultItem.phoneNumber}`}>{poiResultItem.phoneNumber}</a>
      )}

      <div className="h-[150px] flex gap-1 w-full overflow-auto">
        {poiResultItem.photos.map((photo, index) => (
          <img src={photo} className="h-full" key={index} />
        ))}
      </div>
    </div>
  )
}
