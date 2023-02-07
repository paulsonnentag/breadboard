import { EntityMap, UnknownEntityRef } from "../db"
import nearbyWidgetsComputation from "./nearbyWidgetsComputation"
import geoMarkersComputation from "./geoMarkersComputation"
import nameComputation from "./nameComputation"
import weatherComputation from "./weatherComputation"

export interface ComputedValue<T> {
  value: T
  entity: UnknownEntityRef
}

export interface Computation<V> {
  fn: (data: UnknownEntityRef, entities: EntityMap) => V | undefined
  name: string
}

const Index: Computation<any>[] = [
  nearbyWidgetsComputation,
  geoMarkersComputation,
  nameComputation,
  weatherComputation,
]

export function applyComputation(entity: UnknownEntityRef, entities: EntityMap) {
  for (const computation of Index) {
    const value = computation.fn(entity, entities)

    if (value !== undefined) {
      entity.data[computation.name] = value
    }
  }
}
