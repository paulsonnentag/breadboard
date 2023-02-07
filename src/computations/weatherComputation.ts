import { Computation, ComputedValue } from "./index"
import { GeoMarkersComputationProp } from "./geoMarkersComputation"
import { EntityRef } from "../db"
import LatLngLiteral = google.maps.LatLngLiteral
import moment from "moment"

export interface InfoField {
  label?: string
  value: string
}

export interface InfoFieldsComputationProp {
  infoFields: []
}

export interface WeatherPrediction {
  timestamp: number
  temperature: string
}

export interface WeatherInfoProps {
  isWeatherDataLoading: boolean
  weatherData?: any
  weatherPredictions: WeatherPrediction[]
}

function loadWeatherInfo(marker: ComputedValue<LatLngLiteral>) {
  const entity = marker.entity

  const { isWeatherDataLoading, weatherData } = entity.data

  if (isWeatherDataLoading || weatherData) {
    return
  }

  entity.replace("isWeatherDataLoading", true)

  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${marker.value.lat}&longitude=${marker.value.lng}&hourly=temperature_2m`
  )
    .then((res) => res.json())
    .then((data) => {
      entity.replace("weatherData", data)
      entity.retract("isWeatherDataLoading")
    })
}

// this is a bit hacky here because we are doing some side effects in the computation to fetch the weather data
// from the api and store it in the entity

const weatherInfoComputation: Computation<WeatherPrediction[] | undefined> = {
  name: "weatherPredictions",
  fn: (entity: EntityRef<GeoMarkersComputationProp & WeatherInfoProps>) => {
    if (!entity.data.geoMarkers) {
      return undefined
    }

    const ownMarker = entity.data.geoMarkers.find((marker) => marker.entity.id === entity.id)

    if (ownMarker) {
      loadWeatherInfo(ownMarker)
    }

    if (entity.data.weatherData) {
      const { time, temperature_2m } = entity.data.weatherData.hourly

      return (time as string[]).map(
        (timestampText, index) =>
          ({
            timestamp: moment(timestampText).unix() * 1000,
            temperature: temperature_2m[index],
          } as WeatherPrediction)
      )
    }
  },
}

export default weatherInfoComputation
