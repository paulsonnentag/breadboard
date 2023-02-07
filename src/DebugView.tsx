import React, { useState } from "react"
import { EntityRef, UnknownEntityRef, useEntities } from "./db"
import ReactJson from "react-json-view"
import classNames from "classnames"

export default function DebugView() {
  const entities = useEntities()
  const [isDebugMode, setIsDebugMode] = useState(false)

  return (
    <div className="fixed top-3 right-3 bottom-3 pt-10 w-[300px] flex flex-col pointer-events-none">
      <div className="absolute top-0 right-0">
        <label className="flex gap-1 whitespace-nowrap pointer-events-auto">
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
      {isDebugMode && (
        <div
          className="bg-white p-1 flex-1 flex flex-col gap-1 h-full h-screen pointer-events-auto overflow-auto"
          style={{ minHeight: 0 }}
        >
          {Object.values(entities).map((entity: UnknownEntityRef) => {
            return (
              <div
                key={entity.id}
                onMouseOver={() => {
                  entity.replace("isHovered", true)
                }}
                onMouseLeave={() => {
                  entity.retract("isHovered")
                }}
                className={classNames(
                  "p-1 rounded border",
                  entity.data.isHovered ? "border-blue-500" : "border-transparent"
                )}
              >
                <ReactJson
                  displayDataTypes={false}
                  src={entity.data}
                  collapsed={true}
                  enableClipboard={false}
                  name={entity.id.slice(0, 7)}
                  theme="grayscale:inverted"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
