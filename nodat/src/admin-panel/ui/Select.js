// File: src/components/ui/Select.js

import React, { useState } from "react";

// Select Context to manage value and open state
const SelectContext = React.createContext();

export function Select({ children, onValueChange }) {
  const [selectedValue, setSelectedValue] = useState(null);
  const [open, setOpen] = useState(false);

  const handleChange = (value) => {
    setSelectedValue(value);
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{ selectedValue, setSelectedValue, open, setOpen, handleChange }}
    >
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children }) {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full border rounded px-4 py-2 bg-white text-left shadow-sm"
    >
      {children}
    </button>
  );
}

export function SelectValue() {
  const { selectedValue } = React.useContext(SelectContext);
  return <span>{selectedValue || "Select..."}</span>;
}

export function SelectContent({ children }) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;
  return (
    <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow">
      {children}
    </div>
  );
}

export function SelectItem({ value, children }) {
  const { handleChange } = React.useContext(SelectContext);
  return (
    <div
      onClick={() => handleChange(value)}
      className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
    >
      {children}
    </div>
  );
}
