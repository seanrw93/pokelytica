import { Combobox } from "@headlessui/react";
import { useState } from "react";

type ItemSearchSelectProps = {
  options: string[];                 
  value: string | null;                     
  onChange: (value: string | null) => void;
  placeholder?: string,
  disabled?: boolean,
  required?: boolean              
};

export const ItemSearchSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search...", 
  disabled = false, 
  required = false
}: ItemSearchSelectProps) => {
  const [query, setQuery] = useState("");

  const filtered =
    query === ""
      ? options
      : options.filter((opt) =>
          opt.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <Combobox.Input
          className="w-full p-2 rounded bg-gray-700 text-white disabled:text-gray-500 disabled:cursor-not-allowed"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(val: string | null) => val ?? ""}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-gray-800 border border-gray-700">
          {filtered.map((opt) => (
            <Combobox.Option
              key={opt}
              value={opt}
              className="cursor-pointer p-2 hover:bg-gray-700  text-white"
            >
              {opt}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};
