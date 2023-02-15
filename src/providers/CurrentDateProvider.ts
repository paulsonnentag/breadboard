import { useEffect, useState, useCallback } from "react";
import { DateItem } from "../items/DateItem";
import { ForecastItem } from "../items/ForecastItem";
import { LocationItem } from "../items/LocationItem";
import { Item } from "../store";

// TODO: Fire update on new date
export function useCurrentDateProvider(paths: Item[][]) {
  let date = new Date().getTime()
  let values: { [id: string]: DateItem } = {}

  const value: DateItem = {
    date: date
  }

  for (var items of paths) {
    for (var item of items) {
      if (item.type === "date" && !item.value) {
        values[item.id] = value
      }
    }
  }

  return values
}
