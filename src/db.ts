import { Repo } from "automerge-repo"
import { createContext, useCallback, useContext } from "react"
import { v4 } from "uuid"
import { applyComputation } from "./computations"
import { DbContext } from "./db-context"

interface Ref {
  __refId: string
}

function createRef(id: string) {
  return { __refId: id }
}

function isRef(value: any): boolean {
  return value && value.__refId
}

export interface Fact {
  e: string
  key: string
  value: any
}

export interface EntityMap {
  [id: string]: UnknownEntityRef
}

export interface EntityData {
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

      try {
        facts.push({ e: this.id, key: key.toString(), value: replaceObjectValuesWithRefs(value) })
      } catch (err) {
        console.error("invalid fact", {
          e: this.id,
          key: key.toString(),
          value: replaceObjectValuesWithRefs(value),
        })
      }
    })

    return this
  }

  add<K extends keyof T>(key: K, value: T[K]): typeof this {
    this.changeFacts((facts) => {
      facts.push({ e: this.id, key: key.toString(), value: replaceObjectValuesWithRefs(value) })
    })

    return this
  }

  retract<K extends keyof T>(key: K): typeof this {
    this.changeFacts((facts) => {
      for (let index = 0; index < facts.length; index++) {
        const fact = facts[index]
        if (fact.e === this.id && fact.key === key) {
          delete facts[index]
        }
      }
    })

    return this
  }

  destroy() {
    this.changeFacts((facts) => {
      for (let index = 0; index < facts.length; index++) {
        const fact = facts[index]
        if (fact.e === this.id) {
          delete facts[index]
        }
      }
    })
  }
}

// we need to turn any object value into a ref that can be stored in automerge
function replaceObjectValuesWithRefs(value: any): any {
  if (value instanceof EntityRef) {
    return createRef(value.id)
  }

  if (value instanceof Array) {
    return value.map(replaceObjectValuesWithRefs)
  }

  return value
}

export type UnknownEntityRef = EntityRef<Partial<EntityData>>

export function getEntities(
  facts: Fact[],
  changeFacts: (fn: (facts: Fact[]) => void) => void
): EntityMap {
  const entities: EntityMap = {}

  function getEntityRefById(id: string) {
    let entity = entities[id]

    if (!entity) {
      entity = entities[id] = new EntityRef(id, {}, changeFacts)
    }

    return entity
  }

  function resolveRefsInValue(value: any): any {
    if (isRef(value)) {
      return getEntityRefById(value.__refId)
    }

    if (value instanceof Array) {
      return value.map(resolveRefsInValue)
    }

    return value
  }

  for (const { e, key, value } of facts) {
    let entity = getEntityRefById(e)

    entity.data[key] = resolveRefsInValue(value)
  }

  for (const entity of Object.values(entities)) {
    applyComputation(entity, entities)
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

export function useEntities() {
  const context = useContext(DbContext)
  if (!context) {
    throw new Error("missing DbContext")
  }

  return context.entities
}

export function useCreateEntity() {
  const context = useContext(DbContext)

  if (!context) {
    throw new Error("missing DbContext")
  }

  return useCallback(
    <T extends Partial<EntityData>>(data: T) => {
      const id = v4()

      context.changeFacts((facts) => {
        for (const [key, value] of Object.entries(data)) {
          facts.push({ e: id, key, value })
        }
      })

      return new EntityRef(id, data, context.changeFacts)
    },
    [context.changeFacts]
  )
}

export function useFacts() {
  const context = useContext(DbContext)

  if (!context) {
    throw new Error("missing DbContext")
  }

  return context.facts
}
