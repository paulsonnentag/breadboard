import { EntityData, EntityRef } from "../db"
import { Computation, ComputedValue } from "./index"
import LatLngLiteral = google.maps.LatLngLiteral

const geoMarkersComputation: Computation<ComputedValue<LatLngLiteral>[]> = {
  name: "geoMarkers",
  fn: (entity) => {
    return getGeoMarkers(entity)
  },
}

function getGeoMarkers(entity: EntityData): ComputedValue<LatLngLiteral>[] {
  let geoMarkers: ComputedValue<LatLngLiteral>[] = []

  if (entity.latLng) {
    geoMarkers.push({ value: entity.latLng, entity })
  }

  /*
  if (entity.results) {
    geoMarkers.push({ value: })
  }*/

  return geoMarkers
}

export default geoMarkersComputation
