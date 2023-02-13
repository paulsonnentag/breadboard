import { PathWidget } from "./widgets/PathWidget"
import React, { useMemo } from "react"
import { DocumentId, Repo } from "automerge-repo"
import { useDocument } from "automerge-repo-react-hooks"
import { StoreContextProps } from "./store"
import { Widget, WidgetView } from "./widgets"
import { v4 } from "uuid"
import { StoreContext } from "./store"

interface RootProps {
  documentId: DocumentId
}

interface RootDoc {
  rootId: string
  widgets: { [id: string]: Widget }
}

export function createRootDoc(repo: Repo) {
  const handle = repo.create<RootDoc>()

  handle.change((doc) => {
    const pathWidget: PathWidget = {
      id: v4(),
      type: "path",
      widgetIds: [],
    }

    doc.rootId = pathWidget.id
    doc.widgets = { [pathWidget.id]: pathWidget }
  })

  return handle
}

export function Root({ documentId }: RootProps) {
  const [doc, changeDoc] = useDocument<RootDoc>(documentId)

  const context: StoreContextProps | undefined = useMemo(
    () =>
      doc
        ? {
            widgets: doc.widgets,
            changeWidgets: (fn: (widgets: { [id: string]: Widget }) => void) =>
              changeDoc((doc) => fn(doc.widgets)),
          }
        : undefined,
    [doc, changeDoc]
  )

  if (!doc) {
    return null
  }
  return (
    <StoreContext.Provider value={context}>
      <WidgetView id={doc.rootId} />
    </StoreContext.Provider>
  )
}
