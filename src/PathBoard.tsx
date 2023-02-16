import { DocumentId } from "automerge-repo"
import { PathView } from "./PathView"
import { useStore } from "./store"

interface PathBoardViewProps {
  documentId: DocumentId
}

export function PathBoardView({ documentId }: PathBoardViewProps) {
  const {state, actions} = useStore(documentId)

  if (!state) {
    return null
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {state.paths.map((path, index) => (
        <div key={index} className={(state.paths.length === 1 ? "w-screen h-screen flex items-center justify-center " : (index % 2 === 1 ? "bg-alt" : ""))}>
          <PathView
            path={path}
            addView={view => actions.addView(view, index)}
            updateItems={i => actions.updateItems(i, index)}
            onCreateNewPath={path => actions.addPath(path)}
          />
        </div>
      ))}

      {state.paths.length !== 1 && 
        <div className="h-[50px]"></div>
      }
      <div className="absolute bottom-0 h-[50px] w-full bg-gray-200 hover:bg-gray-300 transition-colors font-medium text-gray-500 flex items-center justify-center cursor-pointer" onClick={e => actions.addPath()}>
        &#43;
      </div>
    </div>
  )
}
