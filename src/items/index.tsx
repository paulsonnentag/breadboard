import { Item } from "../store"
import { DateItemDefinition } from "./DateItem"
import { ForecastItemDefinition } from "./ForecastItem"
import { LocationItemDefinition } from "./LocationItem"

export interface ItemDefinition {
  type: string

  icon: string
  color: string

  getTitle: (value:any) => string

  [x: string | number | symbol]: unknown
}

export const ItemDefinitions = {
  [DateItemDefinition.type]: DateItemDefinition,
  [ForecastItemDefinition.type]: ForecastItemDefinition,
  [LocationItemDefinition.type]: LocationItemDefinition
}


interface ItemTokenProps {
  item: Item
}

export function ItemToken({ item }: ItemTokenProps) {
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

      {itemDef.getTitle(item.value)}
    </div>
  )
}