import { Entity, useEntities } from "./db"

export function Board() {
  const entities = useEntities()
  const widgets = Object.values(entities).filter(
    (entity) =>
      entity.width !== undefined &&
      entity.height !== undefined &&
      entity.x !== undefined &&
      entity.y !== undefined
  ) as WidgetEntity[]

  return (
    <div className="w-screen h-screen overflow-auto relative bg-gray-100">
      {widgets.map((widget) => (
        <WidgetContainer widget={widget} key={widget.id} />
      ))}
    </div>
  )
}

interface WidgetEntity extends Entity {
  x: number
  y: number
  width: number
  height: number
}

interface WidgetContainerProps {
  widget: WidgetEntity
}

function WidgetContainer({ widget }: WidgetContainerProps) {
  return (
    <div
      className="absolute border-b-gray-300 rounded bg-white shadow"
      style={{
        top: widget.y,
        left: widget.x,
        width: widget.width,
        height: widget.height,
      }}
    ></div>
  )
}
