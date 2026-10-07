"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";

export default function HeroSearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("page"); // reset pagination
    if (query.trim()) {
      sp.set("q", query.trim());
    } else {
      sp.delete("q");
    }
    startTransition(() => {
      router.push(`/search?${sp.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="hero-search-form">
      <Search size={18} className="hero-search-icon" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, author, keywords..."
        className="hero-search-input"
        aria-label="Search research papers"
      />
      <button type="submit" className="hero-search-btn">
        Search
      </button>
    </form>
  );
}
