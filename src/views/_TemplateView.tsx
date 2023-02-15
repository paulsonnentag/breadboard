import { ItemViewProps, ViewDefinition } from "."
import { Item } from "../store"

export const WeatherViewDefinition: ViewDefinition = {
  name: "weather",
  inputs: ["geolocation", "date", "forecast"],
  displayName: "Weather",
  color: "text-yellow-500",
}

// The proper model would only cause views to receive items they've listed as inputs; for now we are simply passing all the path's data items.
export const WeatherView = ({ items, updateItems }: ItemViewProps) => {
  let location = items.find((i) => i.type == "geolocation")

  return (
    <div className="p-4">
      <h1>Weather!</h1>
    </div>
  )
}