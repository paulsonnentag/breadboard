import { useCallback, useEffect, useState } from "react";
import { DateItem } from "../items/DateItem";
import { ForecastItem } from "../items/ForecastItem";
import { LocationItem } from "../items/LocationItem";
import { Item } from "../store";

interface LatLong {
  lat: number 
  long: number
}

let fetchedForecasts: {[latLong: string]: any} = {}

export function useWeatherProvider(paths: Item[][]) {
  const [values, setValues] = useState({} as { [id: string]: ForecastItem })
  let toFetch: {[id: string]: LatLong} = {}

  for (var items of paths) {
    // Only supporting one location item and one weather view per path atm; can adjust in future.
    const locItem = items.find(i => i.type === "geolocation" && i.value)
    const forecastItem = items.find(i => i.type === "forecast")

    if (locItem && forecastItem) {
      toFetch[forecastItem.id] = locItem.value
    }
  }

  useEffect(() => {
    // TODO: Also cache dates and re-fetch a forecast after ~1 hour?

    for (var id in toFetch) {
      const latLong = toFetch[id]

      if (!latLong.lat || !latLong.long) {
        continue
      }

      if (values[id]) {
        continue
      }

      if (fetchedForecasts[`${latLong.lat}::${latLong.long}`]) {
        // It exists or is loading already
        if (fetchedForecasts[`${latLong.lat}::${latLong.long}`] !== "loading") {
          setValues(forecasts => {
            forecasts[id] = { forecast: fetchedForecasts[`${latLong.lat}::${latLong.long}`] } as ForecastItem
            return forecasts
          })
        }
      }
      else {
        // Need to load
        fetchedForecasts[`${latLong.lat}::${latLong.long}`] = "loading"

        // for documentation see https://open-meteo.com/en/docs
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latLong.lat}&longitude=${latLong.long}&hourly=weathercode,temperature_2m&timeformat=unixtime`
        )
        .then((res) => res.json())
        .then((data) => {
          fetchedForecasts[`${latLong.lat}::${latLong.long}`] = data

          // Could id be out of date in some cases?
          setValues(forecasts => {
            forecasts[id] = { forecast: data } as ForecastItem
            return forecasts
          })
        })
      }
    }
  }, [toFetch])

  return values
}
