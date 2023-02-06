import { EntityData, EntityRef } from "../db"
import { Component, FunctionComponent } from "react"

export interface EntityViewProps<T extends Partial<EntityData>> {
  entity: EntityRef<T>
}

export interface ViewType {
  name: string
  condition: (data: EntityData) => boolean
  view: any
  //view: FunctionComponent<EntityViewProps<Partial<EntityData>>>
}
