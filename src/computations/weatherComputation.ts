import { Computation } from "./index"
import seed from "seed-random"
import { GeoMarkersComputationProp } from "./geoMarkersComputation"
import { EntityRef } from "../db"

export interface InfoField {
  label?: string
  value: string
}

export interface InfoFieldsComputationProp {
  infoFields: []
}

// this is a bit hacky here because we are not computing facts for the entity but instead use it to add
// facts to it's connected entities

const weatherInfoComputation: Computation<undefined> = {
  name: "weatherInfo",
  fn: (entity) => {
    if (entity.data.type === "weather") {
      for (const geoPoint of (entity as EntityRef<GeoMarkersComputationProp>).data.geoMarkers) {
        let infoFields = geoPoint.entity.data.infoFields as InfoField[]

        if (!infoFields) {
          infoFields = geoPoint.entity.data.infoFields = []
        }

        infoFields.push({
          label: "Temp",
          value: `${Math.round(seed(geoPoint.entity.id)() * 100)} ° F`,
        })
      }
    }

    return undefined
  },
}

export default weatherInfoComputation
