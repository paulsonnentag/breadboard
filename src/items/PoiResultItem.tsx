import { ItemDefinition } from "."
import LatLngLiteral = google.maps.LatLngLiteral;

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

export const PoiResultItemDefinition: ItemDefinition = {
  type: "poiResult",
  icon: "distance",
  color: "text-lime-500",

  getTitle: (value:any) => {
    const poiResultItem = value as PoiResultItem

    return poiResultItem.name
  }
}
