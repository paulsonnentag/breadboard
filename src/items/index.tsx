import { Item } from "../store"
import { DateItemDefinition } from "./DateItem"
import { ForecastItemDefinition } from "./ForecastItem"
import { LocationItemDefinition } from "./LocationItem"
import { PoiResultSetItemDefinition } from "./PoiResultItemSet";
import { PoiResultItemDefinition } from "./PoiResultItem";

export interface ItemDefinition {
  type: string

  icon: string
  color: string

  getTitle: (value:any, items: Item[]) => string

  [x: string | number | symbol]: unknown
}

export const ItemDefinitions = {
  [DateItemDefinition.type]: DateItemDefinition,
  [ForecastItemDefinition.type]: ForecastItemDefinition,
  [LocationItemDefinition.type]: LocationItemDefinition,
  [PoiResultSetItemDefinition.type]: PoiResultSetItemDefinition,
  [PoiResultItemDefinition.type]: PoiResultItemDefinition
}


interface ItemTokenProps {
  item: Item
  items: Item[]
}

export function ItemToken({ item, items }: ItemTokenProps) {
  const itemDef = ItemDefinitions[item.type]

  if (!itemDef) {
    return (
      <div
      className={"bg-gray-200 rounded py-2 px-3 font-bold text-xs text-gray-400"}
    >
      Unknown item ("{item.type}")
    </div>
    )
  }

  return (
    <div
      className={"bg-white shadow-sm rounded py-2 px-3 font-bold text-xs "+itemDef.color}
    >
      <span className="material-symbols-rounded font-normal text-xs mr-1">
        {itemDef.icon}
      </span>

      {item.value && itemDef.getTitle(item.value, items)}
      {!item.value && "Loading..."}
    </div>
  )
}