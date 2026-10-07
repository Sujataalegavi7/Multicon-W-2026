"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter } from "lucide-react";
import { useState, useTransition } from "react";

type Meta = {
  conferences: string[];
  years: string[];
};

type FilterValues = {
  sort: string;
  year: string;
  conference: string;
  author: string;
  keyword: string;
};

export default function SearchFilterSidebar({
  meta,
  initialValues,
}: {
  meta: Meta;
  initialValues: FilterValues;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [sort, setSort] = useState(initialValues.sort || "newest");
  const [year, setYear] = useState(initialValues.year || "");
  const [conference, setConference] = useState(initialValues.conference || "");
  const [author, setAuthor] = useState(initialValues.author || "");
  const [keyword, setKeyword] = useState(initialValues.keyword || "");

  const applyParam = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("page"); // reset pagination on filter change
    if (value && value.trim()) {
      sp.set(key, value.trim());
    } else {
      sp.delete(key);
    }
    startTransition(() => {
      router.push(`/search?${sp.toString()}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: string, value: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyParam(key, value);
    }
  };

  return (
    <aside className="search-filter-sidebar">
      <div className="search-filter-card">
        {/* Header */}
        <div className="search-filter-header">
          <div className="search-filter-title-wrap">
            <Filter size={18} className="search-filter-icon" />
            <h2 className="search-filter-title">Filter Results</h2>
          </div>
          <Link href="/search" className="search-filter-clear">
            Clear All
          </Link>
        </div>

        {/* Red horizontal accent bar */}
        <div className="search-filter-accent" />

        {/* Fields list */}
        <div className="search-filter-body">
          {/* SORT BY */}
          <div className="search-filter-group">
            <label className="search-filter-label" htmlFor="filter-sort">
              SORT BY
            </label>
            <div className="search-filter-select-wrap">
              <select
                id="filter-sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  applyParam("sort", e.target.value);
                }}
                className="search-filter-select"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Title A–Z</option>
                <option value="relevant">Most Relevant</option>
              </select>
            </div>
          </div>

          {/* PUBLICATION YEAR */}
          <div className="search-filter-group">
            <label className="search-filter-label" htmlFor="filter-year">
              PUBLICATION YEAR
            </label>
            <div className="search-filter-select-wrap">
              <select
                id="filter-year"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  applyParam("year", e.target.value);
                }}
                className="search-filter-select"
              >
                <option value="">All Years</option>
                {meta.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CONFERENCE */}
          <div className="search-filter-group">
            <label className="search-filter-label" htmlFor="filter-conference">
              CONFERENCE
            </label>
            <div className="search-filter-select-wrap">
              <select
                id="filter-conference"
                value={conference}
                onChange={(e) => {
                  setConference(e.target.value);
                  applyParam("conference", e.target.value);
                }}
                className="search-filter-select"
              >
                <option value="">All Conferences</option>
                {meta.conferences.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AUTHOR */}
          <div className="search-filter-group">
            <label className="search-filter-label" htmlFor="filter-author">
              AUTHOR
            </label>
            <input
              id="filter-author"
              type="text"
              value={author}
              placeholder="Author name..."
              onChange={(e) => setAuthor(e.target.value)}
              onBlur={() => applyParam("author", author)}
              onKeyDown={(e) => handleKeyDown(e, "author", author)}
              className="search-filter-input"
            />
          </div>

          {/* KEYWORD */}
          <div className="search-filter-group">
            <label className="search-filter-label" htmlFor="filter-keyword">
              KEYWORD
            </label>
            <input
              id="filter-keyword"
              type="text"
              value={keyword}
              placeholder="Keyword..."
              onChange={(e) => setKeyword(e.target.value)}
              onBlur={() => applyParam("keyword", keyword)}
              onKeyDown={(e) => handleKeyDown(e, "keyword", keyword)}
              className="search-filter-input"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
