import { getMapLocations, Widget } from "./index"
import { DragEventHandler, useEffect, useMemo } from "react"
import { uuid } from "@automerge/automerge"
import { CreateWidgetDragData } from "../PathBoard"
import { Cross2Icon } from "@radix-ui/react-icons"
import LatLngLiteral = google.maps.LatLngLiteral
import LatLng = google.maps.LatLng
import PlaceResult = google.maps.places.PlaceResult

export interface PoiFinderWidget {
  id: string
  type: "poiFinder"
  results?: PoiResults
}

interface PoiResults {
  latLng: LatLngLiteral
  pois: PoiResultWidget[]
}

interface PoiFinderViewProps {
  widget: PoiFinderWidget
  onChange: (fn: (widget: PoiFinderWidget) => void) => void
  onDestroy: () => void
  widgetsInScope: Widget[]
}

const exampleResult = {
  "formatted_address": "Branderhofer Weg 11, 52066 Aachen, Germany",
  "formatted_phone_number": "0241 99000991",
  "geometry": {
    "location": {
      "lat": 50.7619433,
      "lng": 6.1025851
    },
    "viewport": {
      "south": 50.7602359197085,
      "west": 6.101121719708497,
      "north": 50.7629338802915,
      "east": 6.103819680291502
    }
  },
  "name": "Wohnmobil-Stellplatz Bad Aachen",
  "photos": [
  ],
  "rating": 4.5,
  "website": "http://www.aachen-camping.de/",
  "html_attributions": []
}


export function PoiFinderWidgetView({
  widget,
  onChange,
  onDestroy,
  widgetsInScope,
}: PoiFinderViewProps) {
  const mapLocations = getMapLocations(widgetsInScope)

  const selectedLocation = mapLocations[0]

  const placesService = useMemo(() => {
    // the api requires that you display copyright info, that's why we pass in this dummy div
    return new google.maps.places.PlacesService(document.createElement("div"))
  }, [])

  useEffect(() => {
    // don't refetch , if we already have stored result for the selectedLocation
    if (
      widget.results &&
      new LatLng(widget.results.latLng).equals(new LatLng(selectedLocation.latLng))
    ) {
      return
    }


  }, [selectedLocation.latLng.lat, selectedLocation.latLng.lng])

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl bg-white overflow-hidden">
      <div className="flex p-2 items-center justify-between border-b border-gray-300">
        <div className="text-green-600 p-2">Campground Finder</div>

        <button onClick={onDestroy}>
          <Cross2Icon />
        </button>
      </div>

      {widget.results && (
        <div className="bg-gray-100 flex-1 p-2  overflow-auto" style={{ minHeight: 0 }}>
          <div className=" flex flex-col gap-2">
            {widget.results.pois.map((poiWidget, index) => (
              <PoiResultWidgetListItemView widget={poiWidget} key={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export interface PoiResultWidget {
  id: string
  type: "poiResult"
  name: string
  rating?: number
  latLng: LatLngLiteral
  photos: string[]
  website?: string
  address?: string
  phoneNumber?: string
}

interface PoiResultWidgetListItemViewProps {
  widget: PoiResultWidget
}

function PoiResultWidgetListItemView({ widget }: PoiResultWidgetListItemViewProps) {
  const onDragStart: DragEventHandler<HTMLDivElement> = (evt) => {
    evt.dataTransfer.setData(
      "application/drag-data",
      JSON.stringify({
        type: "create",
        widget,
      } as CreateWidgetDragData)
    )

    evt.stopPropagation()
  }

  return (
    <div
      className="bg-gray-200 rounded-xl p-2 whitespace-nowrap overflow-hidden overflow-ellipsis flex justify-between"
      draggable
      onDragStart={onDragStart}
    >
      {widget.name} {widget.rating}
    </div>
  )
}

interface PoiResultWidgetViewProps {
  widget: PoiResultWidget
  widgetsInScope: Widget[]
  onDestroy: () => void
}

export function PoiResultWidgetView({
  widget,
  widgetsInScope,
  onDestroy,
}: PoiResultWidgetViewProps) {
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl overflow-hidden">
      <div className="flex p-2 items-center justify-between border-b border-gray-300">
        <div className="text-green-600 p-2">Place</div>
        <button onClick={onDestroy}>
          <Cross2Icon />
        </button>
      </div>
      <div
        className="flex-1 overflow-auto p-4 bg-gray-100  flex flex-col gap-1"
        style={{ minHeight: 0 }}
      >
        <h1 className="font-bold text-xl">{widget.name}</h1>

        {widget.address && <p>{widget.address}</p>}
        {widget.website && <a href={widget.website}>{widget.website}</a>}
        {widget.phoneNumber && <a href={`tel:${widget.phoneNumber}`}>{widget.phoneNumber}</a>}

        <div className="h-[150px] flex gap-1 w-full overflow-auto">
          {widget.photos.map((photo, index) => (
            <img src={photo} className="h-full" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
