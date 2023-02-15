import { ItemDefinition } from "."

export interface ForecastItem {
  forecast: any
}

export const ForecastItemDefinition: ItemDefinition = {
  type: "forecast",
  icon: "",
  color: "text-yellow-500",

  getTitle: (value:any) => {
    return "forecast"
  }

  // TODO: inputs - declared by provider, or item?
}