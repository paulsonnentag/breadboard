import { DocumentId } from "automerge-repo"
import { useDocument } from "automerge-repo-react-hooks"
import { DbDoc, EntitiesContext, Fact, getEntities } from "./db"
import { Board } from "./Board"
import { useCallback } from "react"

interface BreadboardProps {
  documentId: DocumentId
}

export default function Root({ documentId }: BreadboardProps) {
  const [doc, changeDoc] = useDocument<DbDoc>(documentId)

  const changeFacts = useCallback((fn: (facts: Fact[]) => void) => {
    changeDoc((doc) => fn(doc.facts))
  }, [])

  if (!doc) {
    return null
  }

  const entities = getEntities(doc.facts, changeFacts)

  return (
    <EntitiesContext.Provider value={entities}>
      <Board />
    </EntitiesContext.Provider>
  )
}
