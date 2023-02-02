import { EntityData } from "../db"
import { EntityViewProps, ViewType } from "./index"

function RawView({ entity }: EntityViewProps<Partial<EntityData>>) {
  return <pre className="p-1">{JSON.stringify(entity.data, null, 2)}</pre>
}

const viewDefition: ViewType = {
  name: "Raw",
  condition: (data: EntityData) => true,
  view: RawView,
}

export default viewDefition
