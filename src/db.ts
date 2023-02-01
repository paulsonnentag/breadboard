import { Repo } from "automerge-repo"
import { createContext, useContext } from "react"

interface Ref {
  __id: string
}

function isRef() {}

export interface Fact {
  e: string
  key: string
  value: any
}

interface EntityMap {
  [id: string]: EntityRef<Partial<EntityData>>
}

interface EntityData {
  [key: string]: any
}

export class EntityRef<T extends Partial<EntityData>> {
  constructor(
    readonly id: string,
    public data: T,
    private readonly changeFacts: (fn: (facts: Fact[]) => void) => void
  ) {}

  replace<K extends keyof T>(key: K, value: T[K]): typeof this {
    this.changeFacts((facts) => {
      for (let index = 0; index < facts.length; index++) {
        const fact = facts[index]

        if (fact.e === this.id && fact.key === key) {
          delete facts[index]
        }
      }

      facts.push({ e: this.id, key: key.toString(), value })
    })

    return this
  }

  add<K extends keyof T>(key: K, value: T[K]): typeof this {
    this.changeFacts((facts) => {
      facts.push({ e: this.id, key: key.toString(), value })
    })

    return this
  }

  retract<K extends keyof T>(key: K, value?: T[K]): typeof this {
    this.changeFacts((facts) => {
      for (let index = 0; index < facts.length; index++) {
        const fact = facts[index]
        if (
          (fact.e === this.id && fact.key === key && value === undefined) ||
          fact.value == value
        ) {
          delete facts[index]
        }
      }
    })

    return this
  }
}

export function getEntities(
  facts: Fact[],
  changeFacts: (fn: (facts: Fact[]) => void) => void
): EntityMap {
  const entities: EntityMap = {}

  for (const { e, key, value } of facts) {
    let entity = entities[e]

    if (!entity) {
      entity = entities[e] = new EntityRef(e, {}, changeFacts)
    }

    entity.data[key] = value
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
