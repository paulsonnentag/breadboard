import { createContext } from "react"
import { EntityMap, Fact } from "./db"

export interface DbContextProps {
  facts: Fact[]
  entities: EntityMap
  changeFacts: (fn: (facts: Fact[]) => void) => void
}

export const DbContext = createContext<DbContextProps | undefined>(undefined)
