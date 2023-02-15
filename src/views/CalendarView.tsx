import { ItemViewProps, ViewDefinition } from "./index"
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar"
import {
  differenceInDays,
  differenceInMilliseconds,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  getMonth,
  getTime,
  getYear,
  isEqual,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useCallback } from "react"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export const CalendarViewDefinition: ViewDefinition = {
  name: "calendar",
  inputs: ["date"],
  displayName: "Calendar",
  color: "text-red-500",
}

// The proper model would only cause views to receive items they've listed as inputs; for now we are simply passing all the path's data items.
export const CalendarView = ({ items, updateItems }: ItemViewProps) => {
  let dateItem = items.find((i) => i.type === "date")

  const start = new Date(dateItem!.value.date)
  const end = dateItem!.value.duration
    ? new Date(dateItem!.value.date + dateItem!.value.duration)
    : start

  const selectedView = getSelectedView(start, end)

  const onChangeView = useCallback(
    (view: View) => {
      updateItems((items) => {
        const dateItem = items.find((i) => i.type === "date")
        if (dateItem) {
          const newDate = getStartOfViewDate(start, view)
          dateItem.value.date = getTime(newDate)
          dateItem.value.duration = getDuration(newDate, view)
        }
      })
    },
    [updateItems]
  )

  const onChangeDate = useCallback(
    (date: Date) => {
      updateItems((items) => {
        const dateItem = items.find((i) => i.type === "date")
        if (dateItem) {
          const newDate = getStartOfViewDate(date, selectedView)
          dateItem.value.date = getTime(newDate)
          dateItem.value.duration = getDuration(newDate, selectedView)
        }
      })
    },
    [updateItems]
  )

  return (
    <Calendar
      localizer={localizer}
      view={selectedView}
      views={
        selectedView === "agenda" ? ["month", "week", "day", "agenda"] : ["month", "week", "day"]
      }
      events={[]}
      onView={onChangeView}
      onNavigate={onChangeDate}
      date={start}
      length={differenceInDays(start, end)}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  )
}

function getSelectedView(start: Date, end: Date): View {
  if (!isEqual(start, startOfDay(start)) || !isEqual(end, endOfDay(end))) {
    return "agenda"
  }

  if (isEqual(start, startOfDay(end))) {
    return "day"
  }

  if (
    isEqual(startOfWeek(start), start) &&
    isEqual(endOfWeek(end), end) &&
    differenceInDays(end, start) === 6
  ) {
    return "week"
  }

  if (
    isEqual(startOfMonth(start), start) &&
    isEqual(endOfMonth(end), end) &&
    getYear(start) == getYear(end) &&
    getMonth(start) == getMonth(end)
  ) {
    return "month"
  }

  return "agenda"
}

function getDuration(start: Date, view: View) {
  switch (view) {
    case "month":
      return differenceInMilliseconds(endOfMonth(start), start)

    case "work_week":
    case "week":
      return 1000 * 60 * 60 * 24 * 7 - 1

    case "day":
      return 1000 * 60 * 60 * 24 - 1

    case "agenda":
      break
  }
}

function getStartOfViewDate(start: Date, view: View) {
  switch (view) {
    case "month":
      return startOfMonth(start)

    case "work_week":
    case "week":
      return startOfWeek(start)

    case "day":
      return startOfDay(start)

    case "agenda":
      return start
  }
}
