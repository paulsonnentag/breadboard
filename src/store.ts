import { DocumentId, Repo } from "automerge-repo";
import { useDocument } from "automerge-repo-react-hooks";
import { useCallback, useEffect, useState } from "react";
import { ItemDefinitions } from "./items";
import { LocationItem } from "./items/LocationItem";
import { ViewDefinitions } from "./views";

export interface Item {
  type: string
  value?: any
  
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
  const geolocation = useGeolocation()

  let state = doc

  if (state && doc) {
    for (var p = 0; p < state.paths.length; p++) {
      for (var i = 0; i < state.paths[p].items.length; i++) {
        if (!doc.paths[p].items[i].value) {
          // Default value - WIP
          switch (doc.paths[p].items[i].type) {
            case "geolocation":
              const value: LocationItem = {
                lat: geolocation.latitude,
                long: geolocation.longitude,
                title: "Current location",
              }

              state.paths[p].items[i].value = value

              break
            default:
              const itemDef = ItemDefinitions[state.paths[p].items[i].type]

              if (itemDef && itemDef.getDefaultValue) {
                state.paths[p].items[i].value = itemDef.getDefaultValue()
              }

              break
          }
        } else {
          // Hydrate
          try {
            state.paths[p].items[i].value = JSON.parse(doc.paths[p].items[i].value)
          } catch (e) {

          }
        }
      }
    }
  }

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
            doc.paths[pathId].items.push({ type: input })
          }
        }
      })
    },
    updateItems: (items: Item[], pathId: number) => {
      console.log("UPDATE ITEMS") // logging to watch for overruns
      updateDoc(doc => {
        items.forEach((item, itemId) => {
          try {
            doc.paths[pathId].items[itemId].value = JSON.stringify(item.value)
          } catch (e) {

          }
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



// From https://github.com/bence-toth/react-hook-geolocation/blob/main/src/index.js
// TODO: Need to add types
// TODO: This is probably just a provider
const useGeolocation = (
  { enableHighAccuracy, maximumAge, timeout } = {},
  callback,
  isEnabled = true
) => {
  const [coordinates, setCoordinates] = useState({
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
    timestamp: null,
    error: null,
  });

  const updateCoordinates = useCallback(
    ({ coords, timestamp }) => {
      const {
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        latitude,
        longitude,
        speed,
      } = coords;

      setCoordinates({
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        latitude,
        longitude,
        speed,
        timestamp,
        error: null,
      });

      if (typeof callback === "function") {
        callback({
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          latitude,
          longitude,
          speed,
          timestamp,
          error: null,
        });
      }
    },
    [callback]
  );

  const setError = useCallback((error:any) => {
    setCoordinates({
      accuracy: null,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude: null,
      longitude: null,
      speed: null,
      timestamp: null,
      error,
    });
  }, []);

  useEffect(() => {
    let watchId: number;

    if (isEnabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(updateCoordinates, setError);
      watchId = navigator.geolocation.watchPosition(
        updateCoordinates,
        setError,
        {
          enableHighAccuracy,
          maximumAge,
          timeout,
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [
    isEnabled,
    callback,
    enableHighAccuracy,
    maximumAge,
    setError,
    timeout,
    updateCoordinates,
  ]);

  return coordinates;
};
