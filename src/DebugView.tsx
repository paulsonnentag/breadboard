import React, { useState } from "react"
import { useEntities } from "./db"
import ReactJson from "react-json-view"

export default function DebugView() {
  const entities = useEntities()
  const [isDebugMode, setIsDebugMode] = useState(false)

  return (
    <div className="relative pt-10 w-[300px] h-full overflow-auto">
      <div className="absolute top-0 right-0">
        <label className="flex gap-1 whitespace-nowrap">
          <input
            type="checkbox"
            checked={isDebugMode}
            onChange={() => {
              setIsDebugMode((isDebugMode) => !isDebugMode)
            }}
          />
          debug mode
        </label>
      </div>
      {isDebugMode &&
        Object.values(entities).map((entity) => {
          return (
            <ReactJson
              key={entity.id}
              displayDataTypes={false}
              src={entity.data}
              collapsed={true}
              enableClipboard={false}
              name={entity.id.slice(0, 7)}
              theme="grayscale:inverted"
            />
          )
        })}
    </div>
  )
}
