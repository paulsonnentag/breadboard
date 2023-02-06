import { EntityData, UnknownEntityRef } from "../db"
import { WidgetView } from "./index"
import { EntityViewProps, ViewType } from "./ViewType"
import { FunctionComponent } from "react"

export interface NamedEntityProps {
  type: "item"
  item: UnknownEntityRef
}

const ItemView: FunctionComponent<EntityViewProps<NamedEntityProps>> = ({ entity }) => {
  return <WidgetView entity={entity.data.item} />
}

const viewType: ViewType = {
  name: "Item",
  condition: (data: EntityData) => data.type === "item",
  view: ItemView,
}

export default viewType
