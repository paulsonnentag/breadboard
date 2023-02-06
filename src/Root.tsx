import { DocumentId } from "automerge-repo"
import { useDocument } from "automerge-repo-react-hooks"
import { DbDoc, Fact, getEntities } from "./db"
import { DbContext } from "./db-context"
import { Board } from "./Board"
import { useCallback, useMemo } from "react"

interface BreadboardProps {
  documentId: DocumentId
}

export default function Root({ documentId }: BreadboardProps) {
  const [doc, changeDoc] = useDocument<DbDoc>(documentId)

  const changeFacts = useCallback((fn: (facts: Fact[]) => void) => {
    changeDoc((doc) => fn(doc.facts))
  }, [])

  const entities = getEntities(doc?.facts ?? [], changeFacts)

  const context = useMemo(
    () =>
      doc
        ? {
            facts: doc.facts,
            entities,
            changeFacts,
          }
        : undefined,
    [doc?.facts, entities, changeFacts]
  )

  if (!doc) {
    return null
  }

  return (
    <DbContext.Provider value={context}>
      <Board />
    </DbContext.Provider>
  )
}
