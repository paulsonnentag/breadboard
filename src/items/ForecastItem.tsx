import { ItemDefinition } from "."
import { DateItem } from "./DateItem";
import { endOfDay, startOfDay, startOfHour } from "date-fns";

export interface ForecastItem {
  forecast: any
}

export const ForecastItemDefinition: ItemDefinition = {
  type: "forecast",
  icon: "clear_day",
  color: "text-yellow-500",

  getTitle: (value:any, items) => {
    const {forecast} = value as ForecastItem

    const dateItem = items.find((item) => item.type === "date")!.value as DateItem




    const start = dateItem.date
    const end = dateItem.duration ? dateItem.date + dateItem.duration : endOfDay(dateItem.date)

    let min: number | undefined = undefined
    let max: number | undefined = undefined


    if (!forecast) {
      return "error"
    }


    forecast.hourly.time.forEach((timestamp: number, index: number) => {
      const timestampInMs = timestamp * 1000

      if (timestampInMs > start && timestampInMs < end) {
        const temperature = forecast.hourly.temperature_2m[index]


        if (!min || temperature < min) {
          min = temperature
        }

        if (!max || temperature > max) {
          max = temperature
        }
      }
    })



    if (!min || !max) {
      return "no data"
    }

    return `${min}° • ${max}°`
  }

  // TODO: inputs - declared by provider, or item?
}