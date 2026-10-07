"use client";
import { X } from "lucide-react";
import { useState } from "react";

/** Comma/Enter-separated chips. Emits a comma-joined string via a hidden input named `name`. */
export default function ChipInput({
  name,
  label,
  initial = [],
  placeholder,
}: {
  name: string;
  label: string;
  initial?: string[];
  placeholder?: string;
}) {
  const [chips, setChips] = useState<string[]>(initial);
  const [text, setText] = useState("");

  const commit = (raw: string) => {
    const add = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !chips.includes(s));
    if (add.length) setChips([...chips, ...add]);
    setText("");
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type="hidden"
        name={name}
        value={[...chips, ...text.split(",").map((s) => s.trim()).filter(Boolean)].join(",")}
      />
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white p-2.5 transition focus-within:border-[#C41230] focus-within:ring-2 focus-within:ring-red-100">
        {chips.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F2] px-2.5 py-1 text-xs font-semibold text-[#C41230] border border-red-100"
          >
            {c}
            <button
              type="button"
              aria-label={`Remove ${c}`}
              onClick={() => setChips(chips.filter((x) => x !== c))}
              className="hover:text-red-900"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={text}
          placeholder={chips.length ? "" : placeholder}
          onChange={(e) => (e.target.value.includes(",") ? commit(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(text);
            }
            if (e.key === "Backspace" && !text && chips.length) {
              setChips(chips.slice(0, -1));
            }
          }}
          onBlur={() => text && commit(text)}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
