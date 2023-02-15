import { ItemViewProps, ViewDefinition } from "."
import {
  startOfToday,
  addHours,
  addDays,
  addMonths,
  getTime,
  startOfMonth,
  differenceInMilliseconds,
  endOfMonth,
} from "date-fns"
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

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000 - 1

// The proper model would only cause views to receive items they've listed as inputs; for now we are simply passing all the path's data items.
export const WeatherView = ({ items, updateItems }: ItemViewProps) => {
  let forecast = items.find((i) => i.type == "forecast")?.value as ForecastItem
  let dateItem = items.find((i) => i.type === "date")

  const dateOptions = useMemo(() => {
    const today = getTime(startOfToday())
    const options: DateItem[] = []

    for (let i = 0; i <= 6; i++) {
      options.push({ date: getTime(addDays(today, i)), duration: MILLISECONDS_IN_DAY })
    }

    for (let i = 1; i <= 6; i++) {
      const date = addMonths(startOfMonth(today), i)

      options.push({
        date: getTime(date),
        duration: differenceInMilliseconds(endOfMonth(date), date),
      })
    }

    return options
  }, [])

  const selectedDateOptionIndex = getSelectedOptionIndex(dateItem!.value.date, dateOptions)

  const onChangeDateOption = (index: number) => {
    updateItems((items) => {
      const dateItem = items.find((i) => i.type === "date")
      if (dateItem) {
        dateItem.value = dateOptions[index]
      }
    })
  }

  return (
    <div className="p-4">
      {!forecast && <h1 className="text-gray-400">Loading...</h1>}
      {forecast && <h1>Weather!</h1>}
      <div>
        <input
          className="w-full"
          type="range"
          min={0}
          max={dateOptions.length - 1}
          step={1}
          value={selectedDateOptionIndex}
          onChange={(evt) => onChangeDateOption(parseInt(evt.target.value, 10))}
        />
        <div className="flex justify-between text-gray-400">
          <button onClick={() => onChangeDateOption(0)} className="cursor-pointer">
            Today
          </button>
          <button onClick={() => onChangeDateOption(6)} className="cursor-pointer ml-4">
            1 week
          </button>
          <button onClick={() => onChangeDateOption(12)} className="cursor-pointer">
            6 months
          </button>
        </div>
      </div>
    </div>
  )
}

// returns closest option that is equal or before the selected date
function getSelectedOptionIndex(date: Date, options: DateItem[]) {
  const timestamp = getTime(date)

  for (let i = 0; i < options.length; i++) {
    const option = options[i]

    if (option.date > timestamp) {
      return Math.max(0, i - 1)
    }
  }

  return options.length - 1
}
