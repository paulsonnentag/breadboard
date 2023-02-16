import { ItemViewProps, ViewDefinition } from "./index"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { PoiResultSetItem } from "../items/PoiResultItem";

export const PoiFinderViewDefinition: ViewDefinition = {
  name: "poiFinder",
  inputs: ["geolocation", "poiResultSet"],
  displayName: "Campgrounds",
  color: "text-green-500",
  icon: "distance",
}

// The proper model would only cause views to receive items they've listed as inputs; for now we are simply passing all the path's data items.
export const PoiFinderView = ({ items, updateItems }: ItemViewProps) => {
  let poiResultSetItem = items.find((i) => i.type === "poiResultSet")

  if (!poiResultSetItem!.value) {
    return <div>{JSON.stringify(poiResultSetItem, null, 2)}</div>
  }

  const resultSetItem: PoiResultSetItem = poiResultSetItem!.value



  return (
    <div className="p-4">

      {!resultSetItem.results && "loading ...."}

      {resultSetItem.results && resultSetItem.results.map((result, index) => (
        <div
          key={index}
          className="bg-gray-200 rounded-xl p-2 whitespace-nowrap overflow-hidden overflow-ellipsis flex justify-between"
        >
          {result.name} {result.rating}
        </div>
      ))}
    </div>

  )
}
