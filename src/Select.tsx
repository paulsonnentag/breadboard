export interface Option<T> {
  name: string
  value: T
}

interface SelectProps<T> {
  selectedOption: Option<T> | undefined
  options: Option<T>[]
  onChange: (option: Option<T> | undefined) => void
}

export function Select<T>({ selectedOption, options, onChange }: SelectProps<T>) {
  return (
    <select
      className="bg-transparent border-b border-b-gray-300 w-fit"
      value={selectedOption?.name}
      onChange={(evt) => {
        const selectedOption = options.find((option) => option.name === evt.target.value)

        onChange(selectedOption)
      }}
    >
      {options.map((option) => (
        <option key={option.name}>{option.name}</option>
      ))}
    </select>
  )
}
