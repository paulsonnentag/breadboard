import { EntityData } from "../db"
import classNames from "classnames"
import { EntityViewProps, ViewType } from "./ViewType"
import {
  InfoField,
  InfoFieldsComputationProp,
  WeatherInfoProps,
} from "../computations/weatherComputation"

export interface NamedEntityProps {
  name: string
  thumbnail?: string
}

export interface IsHoveredProp {
  isHovered?: boolean
}

export interface IsClickedProp {
  isClicked: boolean
}

function NamedEntityView({
  entity,
}: EntityViewProps<
  NamedEntityProps & InfoFieldsComputationProp & IsClickedProp & WeatherInfoProps & IsHoveredProp
>) {
  return (
    <div
      className={classNames("flex gap-2 rounded p-1", {
        "bg-gray-100": entity.data.isHovered,
      })}
      onMouseEnter={() => entity.replace("isHovered", true)}
      onMouseLeave={() => entity.retract("isHovered")}
      onClick={() => {
        // emulate click event
        entity.replace("isClicked", true)

        setInterval(() => {
          entity.retract("isClicked")
        })
      }}
    >
      <div
        className="w-[50px] h-[50px] bg-gray-200 rounded bg-cover flex-shrink-0"
        style={{
          backgroundImage: entity.data.thumbnail && `url(${entity.data.thumbnail})`,
        }}
      />
      <div className="flex justify-between flex-1">
        <div>{entity.data.name}</div>
        {entity.data.weatherPredictions && (
          <div>{entity.data.weatherPredictions[0].temperature} C</div>
        )}
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
