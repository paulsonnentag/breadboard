import { ItemDefinition } from "."

export interface DateItem {
  date: number
  duration?: number
}

export const DateItemDefinition: ItemDefinition = {
  type: "date",
  icon: "",
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

  getDefaultValue: () => {
    return {
      date: new Date().getTime(),
    } as DateItem
  },
}
