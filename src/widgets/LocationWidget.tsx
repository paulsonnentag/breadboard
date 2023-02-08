import LatLngLiteral = google.maps.LatLngLiteral
import { useOnClickOutside } from "../hooks"
import { useEffect, useMemo, useRef, useState } from "react"
import AutocompletePrediction = google.maps.places.AutocompletePrediction

export interface LocationWidget {
  type: "location"
  name: string
  latLng: LatLngLiteral
}

interface LocationWidgetViewProps {
  widget: LocationWidget
  onChange: (fn: (widget: LocationWidget) => void) => void
}

export function LocationWidgetView({ widget, onChange }: LocationWidgetViewProps) {
  const [search, setSearch] = useState("")
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([])
  const autocomplete = useMemo(() => new google.maps.places.AutocompleteService(), [])
  const placesService = useMemo(
    () => new google.maps.places.PlacesService(document.createElement("div")),
    []
  )

  useEffect(() => {
    if (search === "") {
      setPredictions([])
      return
    }

    autocomplete
      .getPlacePredictions({
        input: search,
      })
      .then((result) => {
        setPredictions(result.predictions)
      })
  }, [search])

  const onSelectPlace = (id: string) => {
    setSearch("")
    setPredictions([])

    placesService.getDetails({ placeId: id }, (placeResult) => {
      if (placeResult) {
        onChange((widget) => {
          const { name, geometry } = placeResult
          if (name && geometry && geometry.location) {
            widget.name = name
            widget.latLng = geometry.location.toJSON()
          }
        })
      }
    })
    // onChange((widget) => widget.name = )
  }

  console.log(predictions)

  return (
    <div className="p-2 flex flex-col gap-1">
      <input
        className="text-base"
        value={search}
        onChange={(evt) => setSearch(evt.target.value)}
        placeholder="Search ..."
      />

      {!search && <div className="bg-purple-600 rounded-md text-white p-2">{widget.name}</div>}

      <div className="flex flex-col gap-1 flex-1 overflow-auto" style={{ minHeight: 0 }}>
        {predictions.map((prediction, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-md p-2"
            onClick={() => onSelectPlace(prediction.place_id)}
          >
            {prediction.description}
          </div>
        ))}
      </div>
    </div>
  )
}

export function LocationContextView({ widget, onChange }: LocationWidgetViewProps) {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  useOnClickOutside(ref, () => setIsOpen(false))

  return (
    <div className="relative">
      <div
        className="bg-gray-200 rounded-md px-2 py-1 text-purple-700"
        onClick={(evt) => {
          setIsOpen((isOpen) => !isOpen)
          evt.stopPropagation()
        }}
      >
        {widget.name}
      </div>

      {isOpen && (
        <div
          ref={ref}
          className="absolute -top-3 left-full w-[300px] h-[300px] bg-white rounded z-50 rounded-md shadow ml-3"
        >
          <LocationWidgetView widget={widget} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
