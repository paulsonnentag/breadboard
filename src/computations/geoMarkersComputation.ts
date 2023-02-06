import { EntityData, EntityRef, UnknownEntityRef } from "../db"
import { Computation, ComputedValue } from "./index"
import LatLngLiteral = google.maps.LatLngLiteral

export interface GeoMarkersComputationProp {
  geoMarkers: ComputedValue<LatLngLiteral>[]
}

const geoMarkersComputation: Computation<ComputedValue<LatLngLiteral>[]> = {
  name: "geoMarkers",
  fn: (entity) => {
    return getGeoMarkers(entity)
  },
}

function getGeoMarkers(
  value: any,
  visitedEntityIds: { [id: string]: boolean } = {}
): ComputedValue<LatLngLiteral>[] {
  let geoMarkers: ComputedValue<LatLngLiteral>[] = []

  if (!(value instanceof EntityRef) || visitedEntityIds[value.id]) {
    return []
  }

  visitedEntityIds[value.id] = true

  if (value.data.latLng) {
    geoMarkers.push({ value: value.data.latLng, entity: value })
  }

  if (value.data.items) {
    geoMarkers = geoMarkers.concat(
      value.data.items.flatMap((value: any) => getGeoMarkers(value, visitedEntityIds))
    )
  }

  if (value.data.nearbyWidgets) {
    geoMarkers = geoMarkers.concat(
      value.data.nearbyWidgets.flatMap((value: any) => getGeoMarkers(value, visitedEntityIds))
    )
  }

  return geoMarkers
}

export default geoMarkersComputation
