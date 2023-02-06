import { EntityData } from "../db"
import { EntityViewProps, ViewType } from "./index"
import { registerViewType } from "./view-type-registry"

export interface NamedEntityProps {
  name: string
  thumbnail?: string
}

function NamedEntityView({ entity }: EntityViewProps<NamedEntityProps>) {
  return (
    <div className="p-2 flex gap-2">
      <div
        className="w-[30px] h-[30px] bg-gray-200 rounded bg-cover flex-shrink-0"
        style={{
          backgroundImage: entity.data.thumbnail && `url(${entity.data.thumbnail})`,
        }}
      />
      {entity.data.name}
    </div>
  )
}

registerViewType({
  name: "Named",
  condition: (data: EntityData) => data.name !== undefined,
  view: NamedEntityView,
})
