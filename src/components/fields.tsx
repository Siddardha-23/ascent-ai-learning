"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Controlled textarea with local buffering so typing feels instant while the
 * store debounces persistence. The buffer resyncs when the external value
 * changes (e.g. profile switch or conflict resolution).
 */
export function AutoTextarea({
  value,
  onChange,
  label,
  hint,
  rows = 4,
  maxLength,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  id: string;
}) {
  const [buffer, setBuffer] = useState(value);
  const lastExternal = useRef(value);

  useEffect(() => {
    if (value !== lastExternal.current) {
      lastExternal.current = value;
      setBuffer(value);
    }
  }, [value]);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-navy">
        {label}
      </label>
      {hint && <p className="mb-1.5 text-xs text-ink-faint">{hint}</p>}
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={buffer}
        onChange={(e) => {
          setBuffer(e.target.value);
          lastExternal.current = e.target.value;
          onChange(e.target.value);
        }}
        className="w-full rounded-lg border border-navy-600/20 bg-white p-3 text-sm text-ink shadow-sm focus:border-action focus:outline-none"
      />
      {maxLength && (
        <p className="mt-1 text-right text-xs text-ink-faint">
          {buffer.length.toLocaleString()} / {maxLength.toLocaleString()}
        </p>
      )}
    </div>
  );
}
