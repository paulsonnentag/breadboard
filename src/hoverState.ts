import { createContext, useContext } from "react"

type HoveredItemContext = [ id: string | undefined, setId: (id: string | undefined) => void  ]


export const HoveredItemContext = createContext<HoveredItemContext | undefined>(undefined)

export function useHoveredItemContext() {
  const context = useContext(HoveredItemContext)

  if (!context) {
    throw new Error("missing HoveredItemContext")
  }

  return context
}
