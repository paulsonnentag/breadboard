import { ItemDefinition } from "."

export interface DateItem {
  date: number
  duration?: number // in ms
}

export const DateItemDefinition: ItemDefinition = {
  type: "date",
  icon: "calendar_month",
  color: "text-red-500",

  getTitle: (value: any) => {
    const v = value as DateItem

    if (v) {
      const date = new Date(v.date)
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })

      return formattedDate
    } else {
      return "Unknown date"
    }
  },
}
