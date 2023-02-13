import { Widget } from "./widgets"
import { createContext, useContext } from "react"

export interface StoreContextProps {
  widgets: { [id: string]: Widget }
  changeWidgets: (fn: (widgets: { [id: string]: Widget }) => void) => void
}

export const StoreContext = createContext<StoreContextProps | undefined>(undefined)

export function useWidget(id: string) {
  const context = useContext(StoreContext)

  if (!context) {
    throw new Error("missing store context")
  }

  return context.widgets[id]
}
