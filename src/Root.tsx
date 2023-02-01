import { DocumentId } from "automerge-repo"
import "reactflow/dist/style.css"
import { useDocument } from "automerge-repo-react-hooks"
import { DbDoc, EntitiesContext, getEntities } from "./db"
import { Board } from "./Board"

interface BreadboardProps {
  documentId: DocumentId
}

export default function Root({ documentId }: BreadboardProps) {
  const [doc, changeDoc] = useDocument<DbDoc>(documentId)

  if (!doc) {
    return null
  }

  const entities = getEntities(doc.facts)

  return (
    <EntitiesContext.Provider value={entities}>
      <Board />
    </EntitiesContext.Provider>
  )
}
