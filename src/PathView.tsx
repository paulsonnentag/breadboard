import { ItemToken } from "./items"
import { Path, View } from "./store"
import { UpdateItemsFn, ViewFrame } from "./views"
import { CalendarViewDefinition } from "./views/CalendarView"
import { MapViewDefinition } from "./views/MapView"
import { WeatherViewDefinition } from "./views/WeatherView"
import { PoiFinderViewDefinition } from "./views/PoiFinderView";

interface PathViewProps {
  path: Path
  addView: (view: View) => void
  updateItems: UpdateItemsFn,
  onCreateNewPath: (path: Path) => void
}

export function PathView({ path, addView, updateItems, onCreateNewPath }: PathViewProps) {
  const items = path.items

  return (
    <div
      className="w-full"
    >
      {path.views.length === 0 && 
        <EmptyPathView createView={name => addView({ name })} />
      }
      
      {path.views.length !== 0 && 
        <>
        <div
          className="flex items-center gap-2 mb-2 p-8 pb-0"
        >
          {items.map((item, index) => (
            <ItemToken item={item} key={index} items={items} />
          ))}

          <p
            className="font-medium text-gray-400"
          >&#43;</p>
        </div>
        <div className="flex gap-2 overflow-auto p-8 pt-2">
          {path.views.map((view, index) => (
            <div className="w-[500px] h-[500px] flex-shrink-0" key={index}>
              <ViewFrame view={view} items={items} updateItems={updateItems} onCreateNewPath={onCreateNewPath} />
            </div>
          ))}

          <div className="w-2"></div>

          <EndOfPathView  createView={name => addView({ name })} />
        </div>
        </> 
      }
    </div>
  )
}


interface EndOfPathViewProps {
  createView: (type:string)=>void
}

function EndOfPathView(props:EndOfPathViewProps) {
  return (
    <div className="flex flex-col gap-2 items-center mt-2">
      <LittleSearchButton />
      <div className="h-2"></div>
      <LittleQuickButton icon={MapViewDefinition.icon} color="text-green-600" onClick={() => { props.createView("map") }} />
      <LittleQuickButton icon={PoiFinderViewDefinition.icon} color="text-lime-500" onClick={() => { props.createView("poiFinder") }} />
      <LittleQuickButton icon={WeatherViewDefinition.icon} color="text-yellow-500" onClick={() => { props.createView("weather") }} />
      <LittleQuickButton icon={CalendarViewDefinition.icon} color="text-red-500" onClick={() => { props.createView("calendar") }} />
    </div>
  )
}

function LittleSearchButton() {
  return (
    <button className="bg-white shadow-sm rounded-full h-12 w-12"
    >
      <span className="material-symbols-rounded text-xl font-normal text-gray-400">
        search
      </span>
    </button>
  )
}

interface LittleQuickButtonProps {
  icon: string,
  color: string,
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

function LittleQuickButton(props:LittleQuickButtonProps) {
  return (
    <button 
      className={props.color + " bg-white shadow-sm rounded-md w-12 h-10"}
      onClick={props.onClick}
    >
      <span className="material-symbols-rounded text-base font-normal">
        {props.icon}
      </span>
    </button>
  )
}


interface EmptyPathViewProps {
  createView: (type:string)=>void
}

function EmptyPathView(props:EmptyPathViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px]">
      <input
        className="bg-white rounded-xl shadow-xl px-6 py-5 text-xl w-96"
        type="text"
        placeholder="Search…"
      />
      <div
        className="flex justify-center pt-5 gap-2"
      >
        <QuickButton icon={MapViewDefinition.icon} title="Map" color="text-green-600" onClick={() => { props.createView("map") }} />
        <QuickButton icon="distance" title="Places" color="text-lime-500" onClick={() => { props.createView("places") }} />
        <QuickButton icon={WeatherViewDefinition.icon} title="Weather" color="text-yellow-500" onClick={() => { props.createView("weather") }} />
        <QuickButton icon={CalendarViewDefinition.icon} title="Calendar" color="text-red-500" onClick={() => { props.createView("calendar") }} />
      </div>
    </div>
  )
}

interface QuickButtonProps {
  icon: string,
  title: string,
  color: string,
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

function QuickButton(props:QuickButtonProps) {
  return (
    <button 
      className={props.color + " bg-white shadow-sm rounded-md px-4 py-2 text-sm font-bold"}
      onClick={props.onClick}
    >
      
        <span className="material-symbols-rounded text-base font-normal mr-1">
          {props.icon}
        </span>
      <span className="align-text-bottom">
        {props.title}
      </span>
    </button>
  )
}