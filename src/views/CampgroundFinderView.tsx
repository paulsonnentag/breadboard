import { EntityData, UnknownEntityRef } from "../db"
import { EntityViewProps, ViewType } from "./index"
import { NearbyWidgetProp } from "../computations/closeWidgetsComputation"
import { isMap } from "./MapView"

export interface CampgroundFinderEntityProps {
  type: "campgroundFinder"
}

function isCampgroundFinder(data: EntityData): data is CampgroundFinderEntityProps {
  return data.type === "campgroundFinder"
}

function CampgroundFinderView({
  entity,
}: EntityViewProps<CampgroundFinderEntityProps & NearbyWidgetProp>) {
  const availableBounds = entity.data.nearbyWidgets.filter(
    (widget) => isMap(widget.data) && widget.data.bounds
  )

  return (
    <div className="p-2">
      {availableBounds.map((entity) => (
        <button className="p-1 bg-gray-200" key={entity.id}>
          search nearby
        </button>
      ))}

      {availableBounds.length === 0 && "place me near a map"}
    </div>
  )
}

const viewDefition: ViewType = {
  name: "Campground finder",
  condition: isCampgroundFinder,
  view: CampgroundFinderView,
}

export default viewDefition
