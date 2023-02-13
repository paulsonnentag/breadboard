import React from "react"
import ReactDOM from "react-dom/client"
import { DocumentId, Repo } from "automerge-repo"
import { RepoContext } from "automerge-repo-react-hooks"
import "./index.css"
import { LocalForageStorageAdapter } from "automerge-repo-storage-localforage"
import { BrowserWebSocketClientAdapter } from "automerge-repo-network-websocket"
import { BoardView, createBoardDoc } from "./Board"
import { PathWidgetView } from "./widgets/PathWidget"
import { createRootDoc, Root } from "./Root"

const url = "ws://67.207.88.83" // cloud sync server on DigitalOcean

const repo = new Repo({
  storage: new LocalForageStorageAdapter(),
  network: [new BrowserWebSocketClientAdapter(url)],
  sharePolicy: (peerId) => peerId.includes("storage-server"),
})

const params = new URLSearchParams(window.location.search)

let documentId = params.get("documentId") as DocumentId

if (!documentId) {
  const handle = createRootDoc(repo)
  documentId = handle.documentId
  window.history.replaceState(null, "", `?documentId=${documentId}`)
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RepoContext.Provider value={repo}>
      <Root documentId={documentId} />
    </RepoContext.Provider>
  </React.StrictMode>
)
