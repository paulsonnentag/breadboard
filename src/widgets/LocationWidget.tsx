import LatLngLiteral = google.maps.LatLngLiteral
import AutocompletePrediction = google.maps.places.AutocompletePrediction
import { useOnClickOutside } from "../hooks"
import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, ResetIcon } from "@radix-ui/react-icons"

export interface LocationWidget {
  id: string
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
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex p-2 items-center justify-between border-b border-gray-300">
        <div className="text-purple-600 p-2">Location</div>
      </div>

      <div className="p-2 flex flex-col gap-2 flex-1 bg-gray-100 rounded-b-xl">
        <input
          className="text-base bg-gray-100"
          value={search}
          onChange={(evt) => setSearch(evt.target.value)}
          placeholder="Search ..."
        />

        {!search && <div className="bg-purple-600 rounded-xl text-white p-2">{widget.name}</div>}

        <div className="flex flex-col gap-1 flex-1 overflow-auto" style={{ minHeight: 0 }}>
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-xl p-2 whitespace-nowrap overflow-hidden overflow-ellipsis"
              onClick={() => onSelectPlace(prediction.place_id)}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export interface LocationOverride {
  latLng: LatLngLiteral
  name: string
}

interface LocationPickerViewProps {
  widget: LocationWidget
  override?: LocationOverride
  onChange: (fn: (widget: LocationWidget) => void) => void
  onResetOverride?: () => void
}

export function LocationPickerView({
  widget,
  override,
  onChange,
  onResetOverride,
}: LocationPickerViewProps) {
  const ref = useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useOnClickOutside(ref, () => setIsOpen(false))

  return (
    <div className="relative">
      <div className="bg-gray-200 rounded-xl px-2 text-purple-700 flex text-xs items-center">
        {override ? (
          <>
            <div
              className="bg-purple-600 text-white p-2 flex gap-1"
              onClick={(evt) => {
                onChange((widget) => {
                  widget.name = override?.name
                  widget.latLng = override?.latLng
                })
              }}
            >
              {override.name}

              <ArrowUpIcon />
            </div>
            <div
              className="text-gray-500 p-2 flex gap-1"
              onClick={(evt) => {
                onResetOverride && onResetOverride()
              }}
            >
              {widget.name} <ResetIcon />
            </div>
          </>
        ) : (
          <div
            className="p-2"
            onClick={(evt) => {
              setIsOpen((isOpen) => !isOpen)
              evt.stopPropagation()
            }}
          >
            {widget.name}
          </div>
        )}
      </div>

      {isOpen && (
        <div
          ref={ref}
          className="absolute -top-3 left-full w-[300px] h-[300px] bg-white z-50 rounded-xl shadow ml-3"
        >
          <LocationWidgetView widget={widget} onChange={onChange} />
        </div>
      )}
    </div>
  )
}

interface LocationStackViewProps {
  widgets: LocationWidget[]
  selectedWidgetId?: string
  onSelectWidgetId: (id: string) => void
}

export function LocationStackView({
  widgets,
  selectedWidgetId,
  onSelectWidgetId,
}: LocationStackViewProps) {
  if (widgets.length === 0) {
    return null
  }

  let selectedWidgetIndex = widgets.findIndex(({ id }) => id == selectedWidgetId)
  if (selectedWidgetIndex === -1) {
    selectedWidgetIndex = 0
  }

  const selectedWidget = widgets[selectedWidgetIndex]
  const prevWidget = widgets[positiveMod(selectedWidgetIndex - 1, widgets.length)]
  const nextWidget = widgets[positiveMod(selectedWidgetIndex + 1, widgets.length)]

  return (
    <div className="bg-gray-200 rounded-xl p-2 text-purple-700 flex text-xs items-middle">
      <button
        onClick={() => {
          onSelectWidgetId(prevWidget.id)
        }}
      >
        <ChevronLeftIcon />
      </button>

      <div>{selectedWidget.name}</div>

      <button
        onClick={() => {
          onSelectWidgetId(nextWidget.id)
        }}
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}

function positiveMod(x: number, n: number) {
  return ((x % n) + n) % n
}
