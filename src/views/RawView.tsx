import { EntityData } from "../db"
import { EntityViewProps, ViewType } from "./index"
import ReactJson from "react-json-view"

function RawView({ entity }: EntityViewProps<Partial<EntityData>>) {
  return (
    <ReactJson
      displayDataTypes={false}
      src={entity.data}
      collapsed={1}
      enableClipboard={false}
      name={null}
      theme="grayscale:inverted"
    />
  )
}

const viewDefition: ViewType = {
  name: "Raw",
  condition: (data: EntityData) => true,
  view: RawView,
}

export default viewDefition
