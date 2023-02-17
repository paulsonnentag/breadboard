import { useCallback, useEffect, useRef, useState } from "react"
import { DateItem } from "../items/DateItem"
import { ForecastItem } from "../items/ForecastItem"
import { LocationItem } from "../items/LocationItem"
import { Item } from "../store"
import stations from "./stations.json"
import * as turf from "@turf/helpers"
import nearestPoint from "@turf/nearest-point"
import { parse } from "csv-parse/browser/esm"

interface LatLong {
  lat: number
  long: number
}

let fetchedForecasts: { [latLong: string]: ForecastItem | "loading" } = {}

export function useWeatherProvider(paths: Item[][]) {
  const [values, setValues] = useState(fetchedForecasts as { [id: string]: ForecastItem })

  let toFetch: { [id: string]: LatLong } = {}

  for (var items of paths) {
    // Only supporting one location item and one weather view per path atm; can adjust in future.
    const locItem = items.find((i) => i.type === "geolocation" && i.value)
    const forecast = items.find((i) => i.type === "forecast")

    if (locItem && forecast && !forecast.value) {
      toFetch[forecast.id] = locItem.value
    }
  }

  useEffect(() => {
    for (const id in toFetch) {
      const latLong = toFetch[id]

      if (!latLong.lat || !latLong.long) {
        continue
      }

      let fetchedForecast = fetchedForecasts[`${latLong.lat}::${latLong.long}`]
      if (fetchedForecast) {
        // It exists or is loading already
        if (fetchedForecast !== "loading") {
          setValues((forecasts) => ({
            ...forecasts,
            [id]: { forecast: fetchedForecast } as ForecastItem,
          }))
        }
      } else {
        // Need to load
        fetchedForecasts[`${latLong.lat}::${latLong.long}`] = "loading"

        setValues((forecasts) => ({
          ...forecasts,
          [id]: { forecast: undefined } as ForecastItem,
        }))

        const closestStationId = getClosestStationId(latLong.lat, latLong.long)

        Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latLong.lat}&longitude=${latLong.long}&hourly=weathercode,temperature_2m&timeformat=unixtime`
          ).then((res) => res.json()),
          fetch(
            `https://www.ncei.noaa.gov/data/normals-monthly/2006-2020/access/${closestStationId}.csv`
          )
            .then((res) => res.text())
            .then(
              (res) =>
                new Promise((resolve) => {
                  parse(res, {columns: true},(err, records) => resolve(records))
                })
            ),
        ])

          // for documentation see https://open-meteo.com/en/docs

          .then(([forecast, normals]) => {
            const forecastItem: ForecastItem = {
              forecast,
              normals,
            }

            fetchedForecasts[`${latLong.lat}::${latLong.long}`] = forecastItem

            // Could id be out of date in some cases?
            setValues((forecasts) => ({
              ...forecasts,
              [id]: forecastItem,
            }))
          })
      }
    }
  }, [JSON.stringify(toFetch)]) // this is really aweful but it works

  return values
}

const stationPointsCollection = turf.featureCollection(
  stations.map((station) => {
    return turf.point([station.lat, station.long], { name: station.name })
  })
)

function getClosestStationId(lat: number, long: number) {
  const nearestStationPoint = nearestPoint(turf.point([lat, long]), stationPointsCollection)

  return nearestStationPoint.properties.name
}
