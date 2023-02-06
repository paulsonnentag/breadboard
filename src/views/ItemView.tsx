import { EntityData, EntityRef, UnknownEntityRef } from "../db"
import { EntityViewProps, ViewType, WidgetView } from "./index"
import { registerViewType } from "./view-type-registry"
import { createElement } from "react"
import classNames from "classnames"

export interface NamedEntityProps {
  type: "item"
  item: UnknownEntityRef
}

function ItemView({ entity }: EntityViewProps<NamedEntityProps>) {
  return <WidgetView entity={entity.data.item} />
}

registerViewType({
  name: "Item",
  condition: (data: EntityData) => data.type === "item",
  view: ItemView,
})
