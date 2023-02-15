import { DocumentId, Repo } from "automerge-repo";
import { useDocument } from "automerge-repo-react-hooks";
import { useWeatherProvider } from "./providers/WeatherProvider";
import { ViewDefinitions } from "./views";
import { v4 } from "uuid";
import { useCurrentLocationProvider } from "./providers/CurrentLocationProvider";
import { useCurrentDateProvider } from "./providers/CurrentDateProvider";

export interface Item {
  type: string
  value?: any
  id: string
  
  params?: any 
}

export interface View {
  name: string
}

export interface Path {
  items: Item[]
  views: View[]
}

export interface PathBoardDoc {
  paths: Path[]
}

export function createPathBoardDoc(repo: Repo) {
  const handle = repo.create<PathBoardDoc>()

  handle.change((doc) => {
    doc.paths = [{ 
      items: [],
      views: [],
    }]
  })

  return handle
}

export function useStore(documentId: DocumentId) {
  const [doc, updateDoc] = useDocument<PathBoardDoc>(documentId)

  let state = structuredClone(doc)

  // This imposes a sequence; in reality, we would want no sequence imposed, but this is how hooks have to work. We're using hooks so that providers can issue new values (such as when the current location or date changes).
  state = injectProviderValues(useCurrentDateProvider(structuredClone((state?.paths || []).map(p => p.items))), state)
  state = injectProviderValues(useCurrentLocationProvider(structuredClone((state?.paths || []).map(p => p.items))), state)
  state = injectProviderValues(useWeatherProvider(structuredClone((state?.paths || []).map(p => p.items))), state)

  const actions = {
    addPath: () => {
      updateDoc(doc => {
        doc.paths.push({
          items: [],
          views: [],
        })
      })
    },
    
    addView: (view: View, pathId: number) => {
      updateDoc(doc => {
        doc.paths[pathId].views.push(view)

        const viewDef = ViewDefinitions[view.name]

        if (viewDef && viewDef.inputs) {
          const inputs = viewDef.inputs

          for (const input of inputs) {
            if (!doc.paths[pathId].items.find(i => i.type === input))
            doc.paths[pathId].items.push({ type: input, id: v4() })
          }
        }
      })
    },

    // NOTE: Don't pass items you want providers to continue updating 
    updateItems: (items: Item[], pathIndex: number) => {
      console.log("UPDATE ITEMS") // logging to watch for overruns
      updateDoc(doc => {
        items.forEach((item, itemIndex) => {
          doc.paths[pathIndex].items[itemIndex].value = item.value
        })
      })
    },
    _updateDoc: updateDoc // for dev / debug
  }

  return {
    state,
    actions
  }
}

function injectProviderValues(values: { [id: string]: any }, state?: PathBoardDoc) {
  if (!state) {
    return state
  }

  for (let path of state.paths) {
    for (let item of path.items) {
      if (!item.value && values[item.id]) {
        item.value = values[item.id]
      }
    }
  }

  return state
}


