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
  format,
  startOfDay,
  subMinutes,
  isEqual,
  startOfHour,
} from "date-fns"
import { Item } from "../store"
import { useMemo, useState } from "react"
import { DateItem } from "../items/DateItem"
import { ForecastItem } from "../items/ForecastItem"
import moment, { Moment } from "moment/moment"
import classNames from "classnames"

export const WeatherViewDefinition: ViewDefinition = {
  name: "weather",
  inputs: ["geolocation", "date", "forecast"],
  displayName: "Weather",
  color: "text-yellow-500",
  icon: "clear_day",
}

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000 - 1

interface Forecast {
  timestamp: number
  description: string
  temperature: number
}

type ViewMode = "forecast" | "normals"

// The proper model would only cause views to receive items they've listed as inputs; for now we are simply passing all the path's data items.
export const WeatherView = ({ items, updateItems }: ItemViewProps) => {
  let forecastItem = (items.find((i) => i.type == "forecast")?.value as ForecastItem)
  const { forecast, normals } = forecastItem ?? {}
  let dateItem = items.find((i) => i.type === "date")
  const [viewMode, setViewMode] = useState<ViewMode>("normals")

  const dateOptions = useMemo(() => {
    const today = getTime(startOfToday())
    const options: DateItem[] = []

    for (let i = 0; i <= 6; i++) {
      options.push({ date: getTime(addDays(today, i)), duration: MILLISECONDS_IN_DAY })
    }

    /*for (let i = 1; i <= 6; i++) {
      const date = addMonths(startOfMonth(today), i)

      options.push({
        date: getTime(date),
        duration: differenceInMilliseconds(endOfMonth(date), date),
      })
    }*/

    return options
  }, [])

  const selectedDateOptionIndex = getSelectedOptionIndex(
    dateItem!.value.date + (dateItem!.value.duration ?? 0),
    dateOptions
  )

  const onChangeDateOption = (index: number) => {
    if (dateItem) {
      updateItems([{ ...dateItem, value: dateOptions[index] }])
    }
  }

  const currentHour = startOfHour(Date.now())

  const predictions: Forecast[] = forecast
    ? forecast.hourly.time
        .map((time: number, index: number) => {
          return {
            timestamp: time * 1000,
            description: getWeatherDescription(forecast.hourly.weathercode[index]),
            temperature: forecast.hourly.temperature_2m[index],
          }
        })
        .filter(({ timestamp }: Forecast) =>
          isEqual(startOfDay(subMinutes(timestamp, 1)), startOfDay(dateItem!.value.date))
        )
    : []

  const currentPrediction = predictions.find(({ timestamp }) =>
    isEqual(startOfHour(timestamp), currentHour)
  )

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <div className="border-b border-gray-300  flex flex-col gap-4">
        <div className="flex gap-2 px-2 py-2">
          <button
            className={classNames("rounded-xl p-2 hover:bg-gray-200", {
              "bg-gray-200": viewMode === "forecast",
            })}
            onClick={() => setViewMode("forecast")}
          >
            Forecast
          </button>
          <button
            className={classNames("rounded-xl p-2 hover:bg-gray-200", {
              "bg-gray-200": viewMode === "normals",
            })}
            onClick={() => setViewMode("normals")}
          >
            Averages
          </button>
        </div>
      </div>

      {!forecast && <h1 className="text-gray-400 p-4">Loading...</h1>}


      {viewMode === "normals" && normals && (
        <div className="flex-1 p-4 overflow-auto" style={{minHeight: 0}}>
          <table className="w-full">

            <thead>
              <tr>
                <th className="text-left">Month</th><th className="text-right">Max / Min</th>
              </tr>
            </thead>
            <tbody>
          {normals.map((month : any) => {
            // there is some weirdness in the normals data set where everything is in Fahrenheit for some weird reason
            const min = fahrenheitToCelsius(parseFloat(month["MLY-TMIN-NORMAL"]))
            const max = fahrenheitToCelsius(parseFloat(month["MLY-TMAX-NORMAL"]))


            return (<tr key={month.DATE}>
              <td>{getMonthName(month.DATE)}</td>
              <td className={classNames("text-right", {
                "text-blue-500": min < 0 || max < 0
              })}>{min.toFixed(1)}° / {max.toFixed(1)}°</td>
            </tr>)
          })}
            </tbody>
          </table>
        </div>

      )}

      {viewMode === "forecast" && (
        <>
          {currentPrediction && (
            <div className="flex justify-between px-4 py-2 border-b border-gray-300">
              <div className="font-bold">now</div>
              <div className="flex gap-2">
                <span>{currentPrediction.description}</span>
                 <span className={classNames({
                   "text-blue-500 w-[60px] text-right": currentPrediction.temperature < 0
                 })}>{currentPrediction.temperature.toFixed(1)} °</span>
              </div>
            </div>
          )}

          <div
            className="flex flex-col flex-1 overflow-auto px-4 gap-1 pt-2"
            style={{ minHeight: 0 }}
          >
            {predictions.map((prediction, index) => (
              <div className="flex justify-between" key={index}>
                <div className="">{format(prediction.timestamp, "h a")}</div>
                <div className="flex gap-2">
                  <span>{prediction.description}</span>
                  <span className={classNames({
                    "text-blue-500 w-[60px] text-right": prediction.temperature < 0
                  })}>{prediction.temperature.toFixed(1)} °</span>
                </div>
              </div>
            ))}

            {predictions.length == 0 && (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                no data available
              </div>
            )}
          </div>
        </>
      )}
      {viewMode === "forecast" && (
        <div className="px-4 py-2 border-t border-gray-300">
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
          </div>
        </div>
      )}
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

function getWeatherDescription(code: number): string {
  switch (code) {
    case 0:
      return "Clear sky"
    case 1:
      return "Mainly clear"
    case 2:
      return "Partly cloudy"
    case 3:
      return "Overcast"
    case 45:
      return "Fog"
    case 48:
      return "Depositing rime fog"
    case 51:
      return "Light drizzle"
    case 53:
      return "Moderate drizzle"
    case 55:
      return "Dense drizzle"
    case 56:
      return "Light freezing drizzle"
    case 57:
      return "Intense freezing drizzle"
    case 61:
      return "Slight rain"
    case 63:
      return "Moderate rain"
    case 65:
      return "Heavy rain"
    case 66:
      return "Light freezing rain"
    case 67:
      return "Heavy freezing rain"
    case 71:
      return "Slight snow fall"
    case 73:
      return "Moderate snow fall"
    case 75:
      return "Heavy snow fall"
    case 77:
      return "Snow grains"
    case 80:
      return "Slight rain showers"
    case 81:
      return "Moderate rain showers"
    case 82:
      return "Violent rain showers"
    case 85:
      return "Slight snow showers"
    case 86:
      return "Heavy snow showers"
    case 95:
      return "Thunderstorm"
    case 96:
      return "Thunderstorm with slight hail"
    case 99:
      return "Thunderstorm with heavy hail"
    default:
      return ""
  }
}


function getMonthName(monthNum: string) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Subtract 1 from monthNum since the array is zero-indexed
  const index = parseInt(monthNum) - 1;

  if (index >= 0 && index < months.length) {
    return months[index];
  } else {
    return null;
  }
}

function fahrenheitToCelsius(fahrenheit: number) {
  return (fahrenheit - 32) * (5/9);
}