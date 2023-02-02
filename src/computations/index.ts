import { EntityData, EntityMap, EntityRef, UnknownEntityRef } from "../db"
import { WidgetEntityProps } from "../Board"
import closeWidgetsComputation from "./closeWidgetsComputation"
import geoMarkersComputation from "./geoMarkersComputation"

export interface ComputedValue<T> {
  value: T
  entity: EntityData
}

export interface Computation<V> {
  fn: (data: UnknownEntityRef, entities: EntityMap) => V | undefined
  name: string
}

const Index: Computation<any>[] = [closeWidgetsComputation, geoMarkersComputation]

export function applyComputation(entity: UnknownEntityRef, entities: EntityMap) {
  for (const computation of Index) {
    const value = computation.fn(entity, entities)

    if (value !== undefined) {
      entity.data[computation.name] = value
    }
  }
}
