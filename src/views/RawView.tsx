import { EntityData } from "../db"
import { EntityViewProps, ViewType } from "./index"
import ReactJson from "react-json-view"
import { registerViewType } from "./view-type-registry"

function RawView({ entity }: EntityViewProps<Partial<EntityData>>) {
  return (
    <div className="p-2">
      <ReactJson
        displayDataTypes={false}
        src={entity.data}
        collapsed={1}
        enableClipboard={false}
        name={null}
        theme="grayscale:inverted"
      />
    </div>
  )
}

registerViewType({
  name: "Raw",
  condition: (data: EntityData) => true,
  view: RawView,
})
