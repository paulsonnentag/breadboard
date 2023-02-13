import { getMapLocations, Widget } from "./index"
import { LocationStackView } from "./LocationWidget"
import { useEffect, useState } from "react"
import moment, { Moment } from "moment"
import { CalendarPickerView, CalendarWidget } from "./CalendarWidget"

export interface WeatherWidget {
  id: string
  type: "weather"
}

interface WeatherWidgetViewProps {
  widget: WeatherWidget
  onChange: (fn: (widget: WeatherWidget) => void) => void
  widgetsInScope: Widget[]
}

interface Prediction {
  timestamp: Moment
  description: string
  temperature: number
}

export function WeatherWidgetView({ widget, onChange, widgetsInScope }: WeatherWidgetViewProps) {
  const mapLocations = getMapLocations(widgetsInScope)

  const selectedLocation = mapLocations[0]

  const [weatherData, setWeatherData] = useState<any>()

  const day = moment().startOf("day")
  const currentHour = moment().startOf("hour")

  const predictions: Prediction[] = weatherData
    ? weatherData.hourly.time
        .map((time: number, index: number) => {
          return {
            timestamp: moment(time * 1000),
            description: getWeatherDescription(weatherData.hourly.weathercode[index]),
            temperature: weatherData.hourly.temperature_2m[index],
          }
        })
        .filter(({ timestamp }: Prediction) =>
          timestamp.clone().subtract({ minute: 1 }).startOf("day").isSame(day)
        )
    : []

  const currentPrediction = predictions.find(({ timestamp }) => timestamp.isSame(currentHour))

  useEffect(() => {
    if (!selectedLocation) {
      return
    }

    // for documentation see https://open-meteo.com/en/docs
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.latLng.lat}&longitude=${selectedLocation.latLng.lng}&hourly=weathercode,temperature_2m&timeformat=unixtime`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeatherData(data)
      })
  }, [selectedLocation?.latLng.lng, selectedLocation?.latLng.lat])

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl overflow-hidden">
      <div className="flex p-2 items-center justify-between border-b border-gray-300">
        <div className="text-yellow-600 p-2">Weather</div>
      </div>

      {currentPrediction && (
        <div className="flex justify-between p-2 border-b border-gray-300 bg-gray-100">
          <div className="font-bold">now</div>
          <div>
            {currentPrediction.temperature} ° {currentPrediction.description}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-2 bg-gray-100" style={{ minHeight: 0 }}>
        {predictions.map((prediction, index) => (
          <div className="flex justify-between" key={index}>
            <div className="">{prediction.timestamp.format("h a")}</div>
            <div>
              {prediction.temperature} ° {prediction.description}
            </div>
          </div>
        ))}

        {predictions.length == 0 && (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            no data available
          </div>
        )}
      </div>
    </div>
  )
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
