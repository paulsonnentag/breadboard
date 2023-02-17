import { ItemViewProps, ViewDefinition } from "./index"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { PoiResultSetItem } from "../items/PoiResultItemSet";
import { Path } from "../store";
import { useHoveredItemContext } from "../hoverState";

export const PoiFinderViewDefinition: ViewDefinition = {
  name: "poiFinder",
  inputs: ["geolocation", "poiResultSet"],
  displayName: "Campgrounds",
  color: "text-lime-500",
  icon: "distance",
}

// The proper model would only cause views to receive items they've listed as inputs; for now we are simply passing all the path's data items.
export const PoiFinderView = ({ items, onCreateNewPath }: ItemViewProps) => {
  let poiResultSetItem = items.find((i) => i.type === "poiResultSet")
  const resultSetItem: PoiResultSetItem = poiResultSetItem!.value

  if (!resultSetItem) {
    return null
  }

  return (
    <div className="p-4 flex flex-col gap-2">
      {!resultSetItem.results && "loading ...."}

      {resultSetItem.results && resultSetItem.results.map((result, index) => (
        <div
          key={index}
          className="bg-gray-200 rounded-xl p-2 whitespace-nowrap overflow-hidden overflow-ellipsis flex justify-between cursor-pointer"
          onClick={(event) => {
            if (event.metaKey) {
              onCreateNewPath({
                items: [{ type: "poiResult", value: result, id: result.id}],
                views: [{name: "poiResult"}]
              })
            }
          }}
        >
          {result.name} {result.rating}
        </div>
      ))}
    </div>
  )
}

