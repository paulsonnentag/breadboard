import { ItemToken } from "./items"
import { Path, View } from "./store"
import { UpdateItemsFn, ViewFrame } from "./views"

interface PathViewProps {
  path: Path
  addView: (view: View) => void
  updateItems: UpdateItemsFn
}

export function PathView({ path, addView, updateItems }: PathViewProps) {
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
          {path.items.map((item, index) => (
            <ItemToken item={item} key={index} />
          ))}

          <p
            className="font-medium text-gray-400"
          >&#43;</p>
        </div>
        <div className="flex gap-2 overflow-auto p-8 pt-2">
          {path.views.map((view, index) => (
            <div className="w-[400px] h-[400px] flex-shrink-0" key={index}>
              <ViewFrame view={view} items={path.items} updateItems={updateItems} />
            </div>
          ))}

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
    <div className="flex flex-col gap-2 items-center">
      <LittleSearchButton />
      <LittleQuickButton icon="M" color="text-green-600" onClick={() => { props.createView("map") }} />
      <LittleQuickButton icon="P" color="text-lime-500" onClick={() => { props.createView("places") }} />
      <LittleQuickButton icon="W" color="text-yellow-500" onClick={() => { props.createView("weather") }} />
      <LittleQuickButton icon="C" color="text-red-500" onClick={() => { props.createView("calendar") }} />
    </div>
  )
}

function LittleSearchButton() {
  return (
    <button className="bg-white shadow-sm rounded-full h-12 w-12 font-bold text-gray-400"
    >S</button>
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
      className={props.color + " bg-white shadow-sm rounded-md w-12 h-10 text-sm font-bold"}
      onClick={props.onClick}
    >
      {props.icon}
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
        <QuickButton icon="" title="Map" color="text-green-600" onClick={() => { props.createView("map") }} />
        <QuickButton icon="" title="Places" color="text-lime-500" onClick={() => { props.createView("places") }} />
        <QuickButton icon="" title="Weather" color="text-yellow-500" onClick={() => { props.createView("weather") }} />
        <QuickButton icon="" title="Calendar" color="text-red-500" onClick={() => { props.createView("calendar") }} />
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
      {props.title}
    </button>
  )
}