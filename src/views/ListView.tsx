import { EntityData, EntityRef, UnknownEntityRef } from "../db"
import { EntityViewProps, ViewType, WidgetView } from "./index"
import ReactJson from "react-json-view"
import { registerViewType } from "./view-type-registry"

export interface ListEntityProps {
  items: UnknownEntityRef[]
}

function ListView({ entity }: EntityViewProps<ListEntityProps>) {
  return (
    <div className="p-2">
      {entity.data.items.map((item, index) => (
        <WidgetView entity={item} key={index} />
      ))}
    </div>
  )
}

registerViewType({
  name: "List",
  condition: (data: EntityData) => data.items,
  view: ListView,
})
