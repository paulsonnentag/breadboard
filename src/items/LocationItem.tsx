import { ItemDefinition } from "."
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral

export interface LocationItem {
  lat: number
  long: number
  bounds?: LatLngBoundsLiteral
  title: string
}

export const LocationItemDefinition: ItemDefinition = {
  type: "geolocation",
  icon: "near_me",
  color: "text-purple-800",

  getTitle: (value:any) => {
    const v = value as LocationItem

    if (v) {
      return v.title
    }
    else {
      return "Unknown location"
    }
  },
}
