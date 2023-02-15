import { ItemViewProps, ViewDefinition } from "."
import { startOfToday, addHours, addDays, addMonths, getTime } from "date-fns"
import { Item } from "../store"
import { useMemo } from "react"
import { DateItem } from "../items/DateItem"
import { ForecastItem } from "../items/ForecastItem"

export const WeatherViewDefinition: ViewDefinition = {
  name: "weather",
  inputs: ["geolocation", "date", "forecast"],
  displayName: "Weather",
  color: "text-yellow-500",
}

// The proper model would only cause views to receive items they've listed as inputs; for now we are simply passing all the path's data items.
export const WeatherView = ({ items, updateItems }: ItemViewProps) => {
  let forecast = items.find((i) => i.type == "forecast")?.value as ForecastItem
  let dateItem = items.find((i) => i.type === "date")

  const currentDate = dateItem!.value.date

  const dateOptions = useMemo(() => {
    const today = getTime(startOfToday())
    const tomorrow = getTime(addDays(today, 1))
    const nextWeek = getTime(addDays(today, 7))
    const in2Month = getTime(addMonths(today, 2))
    const in6Months = getTime(addMonths(today, 6))

    return [today, tomorrow, nextWeek, in2Month, in6Months]
  }, [])

  const selectedDateOptionIndex = dateOptions.findIndex((option) => option === currentDate)

  const onChangeDateOption = (index: number) => {
    updateItems((items) => {
      const dateItem = items.find((i) => i.type === "date")
      if (dateItem) {
        dateItem.value.date = dateOptions[index]
      }
    })
  }

  return (
    <div className="p-4">
      {!forecast && 
        <h1 className="text-gray-400">Loading...</h1>
      }
      {forecast && 
        <h1>Weather!</h1>
      }
      <div>
        <input
          className="w-full"
          type="range"
          min={0}
          max={4}
          step={1}
          value={selectedDateOptionIndex}
          onChange={(evt) => onChangeDateOption(parseInt(evt.target.value, 10))}
        />
        <div className="flex justify-between text-gray-400">
          <button onClick={() => onChangeDateOption(0)} className="cursor-pointer">
            Today
          </button>
          <button onClick={() => onChangeDateOption(2)} className="cursor-pointer ml-4">
            1 week
          </button>
          <button onClick={() => onChangeDateOption(4)} className="cursor-pointer">
            6 months
          </button>
        </div>
      </div>
    </div>
  )
}
