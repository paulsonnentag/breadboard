import { EntityData, EntityRef } from "../db"
import { FunctionComponent } from "react"

export interface EntityViewProps<T extends Partial<EntityData>> {
  entity: EntityRef<T>
}

const VIEW_TYPES: ViewType[] = []

export function registerViewType(viewType: ViewType) {
  const existingIndex = VIEW_TYPES.findIndex(({ name }) => name === viewType.name)

  if (existingIndex !== -1) {
    // replace view type in array if same view type is re-registered for example through hot reloading
    VIEW_TYPES[existingIndex] = viewType
  } else {
    VIEW_TYPES.push(viewType)
  }
}

export interface ViewType {
  name: string
  condition: (data: EntityData) => boolean
  view: FunctionComponent<EntityViewProps<Partial<EntityData>>>
}

export function getSupportedViews(data: EntityData): ViewType[] {
  return VIEW_TYPES.filter((viewType) => viewType.condition(data))
}
