import { EntityData } from "./db"
import React, { useRef } from "react"
import { DragHandleDots2Icon } from "@radix-ui/react-icons"
import colors from "tailwindcss/colors"
import { MapEntityProps } from "./views/MapView"
import { CreateWidgetDragData, WidgetEntityProps } from "./Board"
import { CampgroundFinderEntityProps } from "./views/CampgroundFinderView"

const MAP: MapEntityProps & Partial<WidgetEntityProps> = {
  width: 300,
  height: 300,
  center: {
    lng: -87.623177,
    lat: 41.881832,
  },
}

const CAMPGROUND: CampgroundFinderEntityProps & Partial<WidgetEntityProps> = {
  type: "campgroundFinder",
  width: 200,
  height: 300,
}

const EMPTY: Partial<WidgetEntityProps> = {
  width: 300,
  height: 300,
}

export default function WidgetBar() {
  return (
    <div className="flex gap-1">
      <WidgetItem label="Map" data={MAP} />
      <WidgetItem label="Campground finder" data={CAMPGROUND} />
      <WidgetItem label="Empty" data={EMPTY} />
    </div>
  )
}

interface WidgetItemProps {
  label: string
  data: EntityData
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
        entityData: data,
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
      className="bg-gray-400 text-white p-2 rounded flex items-center gap-1"
      draggable={true}
    >
      <DragHandleDots2Icon color={colors.gray[300]} />
      {label}
    </div>
  )
}
