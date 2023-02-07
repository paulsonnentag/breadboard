import { Computation, ComputedValue } from "./index"
import { getWidgets, isWidget, WidgetEntityProps } from "../Board"
import { EntityMap, EntityRef, UnknownEntityRef } from "../db"

const MIN_DISTANCE = 100

export interface NearbyWidgetProp {
  nearbyWidgets: UnknownEntityRef[]
}

const nearbyWidgetsComputation: Computation<UnknownEntityRef[]> = {
  name: "nearbyWidgets",
  fn: (entity, entities) => {
    if (!isWidget(entity)) {
      return
    }

    return getNearbyWidgets(entity, entities, { [entity.id]: true })
  },
}

// todo: this is bad and inefficient, but that doesn't matter for now

function getNearbyWidgets(
  entity: EntityRef<WidgetEntityProps>,
  entities: EntityMap,
  visitedEntityIds: { [id: string]: boolean } = {}
): EntityRef<WidgetEntityProps>[] {
  return getWidgets(entities).flatMap((widget) => {
    if (visitedEntityIds[widget.id]) {
      return []
    }

    visitedEntityIds[widget.id] = true

    const distance = distanceBetweenWidgets(widget.data, entity.data)
    if (distance < MIN_DISTANCE) {
      return [widget].concat(getNearbyWidgets(widget, entities, visitedEntityIds))
    }

    return []
  })
}

function distanceBetweenWidgets(rect1: WidgetEntityProps, rect2: WidgetEntityProps): number {
  let x1 = rect1.x
  let y1 = rect1.y
  let width1 = rect1.width
  let height1 = rect1.height

  let x2 = rect2.x
  let y2 = rect2.y
  let width2 = rect2.width
  let height2 = rect2.height

  let left = x2 + width2 < x1
  let right = x1 + width1 < x2
  let bottom = y2 + height2 < y1
  let top = y1 + height1 < y2

  if (top && left) {
    return distance(x1, y1 + height1, x2 + width2, y2)
  } else if (left && bottom) {
    return distance(x1, y1, x2 + width2, y2 + height2)
  } else if (bottom && right) {
    return distance(x1 + width1, y1, x2, y2 + height2)
  } else if (right && top) {
    return distance(x1 + width1, y1 + height1, x2, y2)
  } else if (left) {
    return x1 - x2 - width2
  } else if (right) {
    return x2 - x1 - width1
  } else if (bottom) {
    return y1 - y2 - height2
  } else if (top) {
    return y2 - y1 - height1
  } else {
    // rectangles intersect
    return 0
  }
}

export default nearbyWidgetsComputation

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
