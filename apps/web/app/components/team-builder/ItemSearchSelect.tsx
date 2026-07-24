"use client";

import { Combobox, ComboboxOptions } from "@headlessui/react";
import { useState, useMemo } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";

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

  const filtered = useMemo(() => {
    const results = query === ""
      ? options
      : options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));
    return results.slice(0, 50);
  }, [options, query]);

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <PiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
        <Combobox.Input
          className="w-full pl-8 pr-2 py-2 rounded-md bg-surface-raised border border-border text-foreground placeholder:text-muted disabled:text-muted disabled:cursor-not-allowed focus:outline-none focus:border-accent transition-colors duration-150"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(val: string | null) => val ?? ""}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface border border-border shadow-lg shadow-black/40">
          {filtered.map((opt) => (
            <Combobox.Option
              key={opt}
              value={opt}
              className="cursor-pointer p-2 text-foreground hover:bg-surface-raised hover:text-accent transition-colors duration-100"
            >
              {opt}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};