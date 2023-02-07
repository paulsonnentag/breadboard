import { EntityMap, UnknownEntityRef } from "../db"
import closeWidgetsComputation from "./closeWidgetsComputation"
import geoMarkersComputation from "./geoMarkersComputation"
import nameComputation from "./nameComputation"

export interface ComputedValue<T> {
  value: T
  entity: UnknownEntityRef
}

export interface Computation<V> {
  fn: (data: UnknownEntityRef, entities: EntityMap) => V | undefined
  name: string
}

const Index: Computation<any>[] = [closeWidgetsComputation, geoMarkersComputation, nameComputation]

export function applyComputation(entity: UnknownEntityRef, entities: EntityMap) {
  for (const computation of Index) {
    const value = computation.fn(entity, entities)

    if (value !== undefined) {
      entity.data[computation.name] = value
    }
  }
}
