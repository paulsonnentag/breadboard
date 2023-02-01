import { Repo } from "automerge-repo"
import { createContext, useContext } from "react"

interface Ref {
  __id: string
}

function isRef() {}

interface Fact {
  e: string
  key: string
  value: any
}

const facts = []

export interface Entity {
  id: string
  [key: string]: any
}

interface EntityMap {
  [id: string]: Entity
}

export function getEntities(facts: Fact[]): EntityMap {
  const entities: EntityMap = {}

  for (const { e, key, value } of facts) {
    let entity = entities[e]

    if (!entity) {
      entity = entities[e] = { id: e }
    }

    entity[key] = value
  }

  return entities
}

export interface DbDoc {
  facts: Fact[]
}

export function createDatabaseDoc(repo: Repo, initialFacts: Fact[] = []) {
  const handle = repo.create<DbDoc>()

  handle.change((doc) => {
    doc.facts = initialFacts
  })

  return handle
}

export const EntitiesContext = createContext<EntityMap>({})

export function useEntities() {
  return useContext(EntitiesContext)
}
