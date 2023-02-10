import { EntityData } from "./db"
import React, { useRef } from "react"
import { DragHandleDots2Icon } from "@radix-ui/react-icons"
import colors from "tailwindcss/colors"
import { CreateWidgetDragData } from "./Board"
import { uuid } from "@automerge/automerge"
import moment from "moment/moment"
import { WeatherWidget } from "./widgets/WeatherWidget"
import { Widget } from "./widgets"

interface WidgetItem {
  width: number
  height: number
  widget: Widget
}

const MAP: WidgetItem = {
  width: 600,
  height: 600,
  widget: {
    id: uuid(),
    type: "map",
    locationWidget: {
      id: uuid(),
      type: "location",
      name: "current location",
      latLng: {
        lat: 50.775555,
        lng: 6.083611,
      },
    },
  },
}

const POI_FINDER: WidgetItem = {
  width: 400,
  height: 600,
  widget: {
    id: uuid(),
    type: "poiFinder",
  },
}

const WEATHER: WidgetItem = {
  width: 400,
  height: 300,
  widget: {
    id: uuid(),
    type: "weather",
    calendarWidget: {
      id: uuid(),
      type: "calendar",
      date: moment().unix() * 1000,
    },
  } as WeatherWidget,
}

export default function WidgetBar() {
  return (
    <div className="flex gap-1 fixed top-3 left-3">
      <WidgetItem label="Map" data={MAP} />
      <WidgetItem label="Campground finder" data={POI_FINDER} />
      <WidgetItem label="Weather" data={WEATHER} />
    </div>
  )
}

interface WidgetItemProps {
  label: string
  data: WidgetItem
  width: number
  height: number
}
function WidgetItem({ label, data }: WidgetItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onDragStart = (evt: React.DragEvent) => {
    if (!ref.current) {
      return
    }

    var bounds = ref.current.getBoundingClientRect()

    evt.dataTransfer.setData(
      "application/drag-data",
      JSON.stringify({
        type: "create",
        widget: data.widget,
        height: data.height,
        width: data.width,
        offsetX: evt.clientX - bounds.left,
        offsetY: evt.clientY - bounds.top,
      } as CreateWidgetDragData)
    )
    evt.dataTransfer.dropEffect = "copy"
  }

  return (
    <div
      ref={ref}
      onDragStart={onDragStart}
      className="bg-gray-400 text-white p-2 rounded-xl flex items-center gap-1"
      draggable={true}
    >
      <DragHandleDots2Icon color={colors.gray[300]} />
      {label}
    </div>
  )
}
