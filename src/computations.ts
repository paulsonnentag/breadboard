import { EntityData, EntityMap, EntityRef } from "./db"
import LatLng = google.maps.LatLng

interface ComputedValue<T> {
  value: T
  entity: EntityData
}

const geoMarkersComputation: Computation<ComputedValue<LatLng>[]> = {
  name: "geoMarkers",
  fn: (entity) => {
    return getGeoMarkers(entity)
  },
}

function getGeoMarkers(entity: EntityData): ComputedValue<LatLng>[] {
  let geoMarkers: ComputedValue<LatLng>[] = []

  if (entity.latLng) {
    geoMarkers.push({ value: entity.latLng, entity })
  }

  for (const [key, value] of Object.entries(entity)) {
    if (value instanceof EntityRef) {
      geoMarkers = geoMarkers.concat(getGeoMarkers(value))
    }
  }

  return geoMarkers
}

interface Computation<V> {
  fn: (data: EntityData, entities: { [id: string]: EntityData }) => V
  name: string
}

const COMPUTATIONS: Computation<any>[] = [geoMarkersComputation]

export function applyComputation(data: EntityData, entities: EntityMap) {
  for (const computation of COMPUTATIONS) {
    const value = computation.fn(data, entities)

    if (value !== undefined) {
      data[computation.name] = value
    }
  }
}
