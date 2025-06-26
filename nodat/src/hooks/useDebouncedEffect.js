import { useEffect, useState } from "react";

// Custom Hook to debounce the search input
export function useDebouncedEffect(callback, delay) {
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      callback(debouncedValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedValue, delay]);

  return setDebouncedValue;
}
