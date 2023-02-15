import { ItemDefinition } from "."

export interface ForecastItem {
  forecast: any
}

export const ForecastItemDefinition: ItemDefinition = {
  type: "forecast",
  icon: "clear_day",
  color: "text-yellow-500",

  getTitle: (value:any) => {
    return "Summary (TODO)"
  }

  // TODO: inputs - declared by provider, or item?
}