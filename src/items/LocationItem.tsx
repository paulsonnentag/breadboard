import { ItemDefinition } from "."

export interface LocationItem {
  lat: number
  long: number
  title: string
}

export const LocationItemDefinition: ItemDefinition = {
  type: "geolocation",
  icon: "",
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
