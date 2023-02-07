import { Computation } from "./index"
import { getSupportedViews } from "../views/view-type-registry"

export interface NameComputationProp {
  name: string
}

const nameComputation: Computation<string> = {
  name: "name",
  fn: (entity) => {
    if (entity.data.name) {
      return
    }

    return getSupportedViews(entity.data)[0].name // todo: adapt this once we allow users to pick custom views
  },
}

export default nameComputation
