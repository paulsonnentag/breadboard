import { ItemDefinition } from "."
import { PoiResultItem } from "./PoiResultItem";

export interface PoiResultSetItem {
  results: PoiResultItem[] | undefined
}


export const PoiResultSetItemDefinition: ItemDefinition = {
  type: "poiResultSet",
  icon: "distance",
  color: "text-lime-500",

  getTitle: (value:any) => {
    const poiResultSetItem = value as PoiResultSetItem

    if (!poiResultSetItem.results) {
      return "...loading"
    }

    const count = poiResultSetItem.results?.length

    return `${count} Campground${count !== 1 ? "s" : ""}`
  }
}
