import { EntityData, EntityRef, UnknownEntityRef } from "../db"
import { EntityViewProps } from "./ViewType"
import { GeoMarkersComputationProp } from "../computations/geoMarkersComputation"
import { Option, Select } from "../Select"
import LatLngLiteral = google.maps.LatLngLiteral
import { ComputedValue } from "../computations"

export interface WeatherEntityProps {
  type: "weather"
  selectedEntity?: UnknownEntityRef
  selectedLatLng?: LatLngLiteral
}

function WeatherView({ entity }: EntityViewProps<WeatherEntityProps & GeoMarkersComputationProp>) {
  const { selectedEntity, selectedLatLng, geoMarkers } = entity.data

  const selectedOption =
    selectedLatLng && selectedEntity
      ? {
          value: { entity: selectedEntity, value: selectedLatLng },
          name: selectedEntity.data.name,
        }
      : undefined

  let options: Option<ComputedValue<LatLngLiteral>>[] = geoMarkers.map((geomarker) => ({
    value: geomarker,
    name: entityToName(geomarker.entity),
  }))

  if (options.length === 0 && selectedOption) {
    options = [selectedOption]
  }

  return (
    <div className="p-2">
      Weather
      <Select
        selectedOption={selectedOption ?? options[0]}
        options={options}
        onChange={(option) => {
          if (option) {
            console.log(option.value)

            // store it as two separate properties because currently we don't support normalizing entities to refIds inside of objects
            entity.replace("selectedEntity", option.value.entity)
            entity.replace("selectedLatLng", JSON.parse(JSON.stringify(option.value.value))) // remove automerge data
          } else {
            entity.retract("selectedEntity")
            entity.retract("selectedLatLng")
          }
        }}
      />
      <pre>{selectedOption && JSON.stringify(selectedOption.value.value, null, 2)}</pre>
    </div>
  )
}

function entityToName(entity: UnknownEntityRef): string {
  return entity.data.name
}

const viewType = {
  name: "Weather for",
  condition: (data: EntityData) => data.type === "weather",
  view: WeatherView,
}

export default viewType
