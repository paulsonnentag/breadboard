import { EntityData } from "../db"
import ReactJson from "react-json-view"
import { EntityViewProps } from "./ViewType"

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

const viewType = {
  name: "Raw",
  condition: (data: EntityData) => true,
  view: RawView,
}

export default viewType
