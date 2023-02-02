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

// helpers

export function isWidget(entity: UnknownEntityRef): entity is EntityRef<WidgetEntityProps> {
  return (
    entity.data.width !== undefined &&
    entity.data.height !== undefined &&
    entity.data.x !== undefined &&
    entity.data.y !== undefined
  )
}

export function getWidgets(
  entities: UnknownEntityRef[] | EntityMap
): EntityRef<WidgetEntityProps>[] {
  return Object.values(entities).filter(isWidget)
}
