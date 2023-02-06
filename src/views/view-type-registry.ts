import { EntityData } from "../db"
import { ViewType } from "./ViewType"

let VIEW_TYPES: ViewType[] = []

export function setViewTypes(viewTypes: ViewType[]) {
  VIEW_TYPES = viewTypes
}

export function getSupportedViews(data: EntityData): ViewType[] {
  return VIEW_TYPES.filter((viewType) => viewType.condition(data))
}
