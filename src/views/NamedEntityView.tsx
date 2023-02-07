import { EntityData } from "../db"
import classNames from "classnames"
import { EntityViewProps, ViewType } from "./ViewType"
import { InfoField, InfoFieldsComputationProp } from "../computations/weatherComputation"

export interface NamedEntityProps {
  name: string
  thumbnail?: string
  isHovered?: boolean
}

function NamedEntityView({
  entity,
}: EntityViewProps<NamedEntityProps & InfoFieldsComputationProp>) {
  return (
    <div
      className={classNames("flex gap-2 rounded p-1", {
        "bg-gray-100": entity.data.isHovered,
      })}
      onMouseEnter={() => entity.replace("isHovered", true)}
      onMouseLeave={() => entity.retract("isHovered")}
    >
      <div
        className="w-[50px] h-[50px] bg-gray-200 rounded bg-cover flex-shrink-0"
        style={{
          backgroundImage: entity.data.thumbnail && `url(${entity.data.thumbnail})`,
        }}
      />
      <div>
        {entity.data.name}

        {entity.data.infoFields &&
          entity.data.infoFields.map(({ label, value }: InfoField, index: number) => (
            <div key={index}>
              {label} {value}
            </div>
          ))}
      </div>
    </div>
  )
}

const viewType: ViewType = {
  name: "Named",
  condition: (data: EntityData) => data.name !== undefined,
  view: NamedEntityView,
}

export default viewType
