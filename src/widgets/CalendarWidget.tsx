import { Widget } from "./index"
import moment, { Moment } from "moment"
import { useRef, useState } from "react"
import { useOnClickOutside } from "../hooks"
import { ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, ResetIcon } from "@radix-ui/react-icons"
import { LocationOverride, LocationWidget, LocationWidgetView } from "./LocationWidget"
import colors from "tailwindcss/colors"

export interface CalendarWidget {
  id: string
  type: "calendar"
  date: number
}

interface CalendarPickerViewProps {
  widget: CalendarWidget
  onChange: (fn: (widget: CalendarWidget) => void) => void
}

export function CalendarPickerView({ widget, onChange }: CalendarPickerViewProps) {
  const date = moment(widget.date)

  const isToday = date.clone().startOf("day").isSame(new Date())

  return (
    <div className="bg-gray-200 rounded-xl p-2 text-red-700 flex text-xs items-center">
      <button
        onClick={() => {
          onChange((widget) => (widget.date = date.clone().subtract({ day: 1 }).unix() * 1000))
        }}
      >
        <ChevronLeftIcon color={colors.gray[500]} />
      </button>

      <div>{isToday ? "today" : date.format("DD MMM")}</div>

      <button
        onClick={() => {
          onChange((widget) => (widget.date = date.clone().add({ day: 1 }).unix() * 1000))
        }}
      >
        <ChevronRightIcon color={colors.gray[500]} />
      </button>
    </div>
  )
}
