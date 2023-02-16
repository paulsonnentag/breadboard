import { ItemDefinition } from "."
import LatLngLiteral = google.maps.LatLngLiteral;

export interface PoiResultSetItem {
  results: PoiResultItem[] | undefined
}

export interface PoiResultItem {
  id: string
  name: string
  rating?: number
  latLng: LatLngLiteral
  photos: string[]
  website?: string
  address?: string
  phoneNumber?: string
}

export const PoiResultSetItemDefinition: ItemDefinition = {
  type: "poiResultSet",
  icon: "distance",
  color: "text-lime-800",

  getTitle: (value:any) => {
    const poiResultSetItem = value as PoiResultSetItem

    if (!poiResultSetItem.results) {
      return "...loading"
    }

    const count = poiResultSetItem.results?.length

    return `${count} Campground ${count !== 1 ? "s" : ""}`
  }
}
