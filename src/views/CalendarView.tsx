import { EntityData, EntityRef, UnknownEntityRef } from "../db"
import { EntityViewProps } from "./ViewType"
import {
  Calendar,
  momentLocalizer,
  Event,
  EventProps,
  EventWrapperProps,
  DateCellWrapperProps,
} from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import moment, { Moment } from "moment"
import { NearbyWidgetProp } from "../computations/nearbyWidgetsComputation"
import { WeatherInfoProps, WeatherPrediction } from "../computations/weatherComputation"
import { IsHoveredProp } from "./NamedEntityView"
import ColorScale from "color-scales"

export interface CalendarEntityProps {
  type: "calendar"
}

const localizer = momentLocalizer(moment)

const temparatureColorScale = new ColorScale(-5, 40, ["#38bdf8", "#ea580c"])

function CalendarView({
  entity,
}: EntityViewProps<Partial<CalendarEntityProps & NearbyWidgetProp>>) {
  const info = getHoveredWeatherInfo(entity.data.nearbyWidgets ?? [])

  let events: Event[] = []

  if (info) {
    events = groupPredictionByDate(info).flatMap((group, index) =>
      group.predictions.map((prediction) => ({
        id: index,
        title: `${prediction.temperature} °`,
        start: new Date(prediction.timestamp),
        allDay: false,
        end: moment(prediction.timestamp).add({ minute: 59 }).toDate(),
        resource: {
          type: "temperature",
          temperature: prediction.temperature,
        },
      }))
    )
  }

  return (
    <div className="p-2">
      <Calendar
        localizer={localizer}
        views={["day", "week", "month"]}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        formats={{
          eventTimeRangeFormat: () => "", // hack to not display the date range next to the temperature
        }}
        eventPropGetter={(event, start, end, isSelected) => {
          if (event.resource.type === "temperature") {
            return {
              style: {
                backgroundColor: temparatureColorScale
                  .getColor(event.resource.temperature)
                  .toRGBString(),
                borderColor: "transparent",
              },
            }
          }

          return {
            style: {
              backgroundColor: "red",
            },
          }
        }}
      />
    </div>
  )
}

const viewType = {
  name: "Calendar",
  condition: (data: EntityData) => data.type === "calendar",
  view: CalendarView,
}

export default viewType

function getHoveredWeatherInfo(widgets: UnknownEntityRef[]): WeatherPrediction[] | undefined {
  for (const widget of widgets) {
    if (widget.data.item) {
      const item = widget.data.item as EntityRef<WeatherInfoProps & IsHoveredProp>

      if (item.data.isHovered && item.data.weatherPredictions) {
        return item.data.weatherPredictions
      }
    }

    if (widget.data.items) {
      for (const item of widget.data.items) {
        if (item.data.isHovered && item.data.weatherPredictions) {
          return item.data.weatherPredictions
        }
      }
    }
  }
}

function groupPredictionByDate(predictions: WeatherPrediction[]) {
  const groups: { [key: string]: { date: Moment; predictions: WeatherPrediction[] } } = {}

  for (const prediction of predictions) {
    const date = moment(prediction.timestamp)
    const key = date.format("YYYY-DD-MM")
    let group = groups[key]

    if (!group) {
      group = groups[key] = { date, predictions: [] }
    }

    group.predictions.push(prediction)
  }

  return Object.values(groups)
}
