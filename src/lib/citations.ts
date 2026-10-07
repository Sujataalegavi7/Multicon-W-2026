// Pure functions: no DB, no I/O. Given a paper, produce APA / MLA / IEEE / BibTeX strings.
export type CiteInput = {
  title: string;
  authors: string[];
  conferenceName: string;
  conferenceDate?: string;
  conferenceLocation?: string;
  doi?: string;
  createdAt?: string;
};

const TITLES = /^(dr|prof|professor|mr|mrs|ms|er|shri|smt)\.?$/i;

/** "Dr. R. Sharma" -> { first: "R.", last: "Sharma", initials: "R." } */
export function parseName(raw: string) {
  const parts = raw.replace(/,/g, " ").split(/\s+/).filter((p) => p && !TITLES.test(p));
  if (!parts.length) return { last: raw.trim(), initials: "", firstNames: "" };
  const last = parts[parts.length - 1];
  const given = parts.slice(0, -1);
  const initials = given.map((g) => g[0].toUpperCase() + ".").join(" ");
  return { last, initials, firstNames: given.join(" ") };
}

export function citeYear(p: CiteInput) {
  const m = p.conferenceDate?.match(/\b(19|20)\d{2}\b/);
  if (m) return m[0];
  return p.createdAt ? String(new Date(p.createdAt).getFullYear()) : "n.d.";
}

const doiUrl = (doi?: string) => (doi ? `https://doi.org/${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "")}` : "");

export function apa(p: CiteInput) {
  const names = p.authors.map(parseName).map((n) => (n.initials ? `${n.last}, ${n.initials}` : n.last));
  let a: string;
  if (names.length === 1) a = names[0];
  else if (names.length <= 20) a = names.slice(0, -1).join(", ") + ", & " + names[names.length - 1];
  else a = names.slice(0, 19).join(", ") + ", ... " + names[names.length - 1];
  const loc = p.conferenceLocation ? ` ${p.conferenceLocation}.` : "";
  return `${a} (${citeYear(p)}). ${p.title}. In ${p.conferenceName}.${loc}${p.doi ? " " + doiUrl(p.doi) : ""}`.trim();
}

export function mla(p: CiteInput) {
  const n = p.authors.map(parseName);
  let a = "";
  if (n.length === 1) a = `${n[0].last}, ${n[0].firstNames}`.replace(/, $/, "");
  else if (n.length === 2) a = `${n[0].last}, ${n[0].firstNames}, and ${n[1].firstNames} ${n[1].last}`;
  else if (n.length > 2) a = `${n[0].last}, ${n[0].firstNames}, et al`;
  const loc = p.conferenceLocation ? ` ${p.conferenceLocation},` : "";
  return `${a}. "${p.title}." ${p.conferenceName},${loc} ${citeYear(p)}${p.doi ? ", " + doiUrl(p.doi) : ""}.`.replace(/\.\./g, ".");
}

export function ieee(p: CiteInput) {
  const names = p.authors.map(parseName).map((n) => (n.initials ? `${n.initials} ${n.last}` : n.last));
  let a: string;
  if (names.length <= 2) a = names.join(" and ");
  else if (names.length <= 6) a = names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  else a = names[0] + " et al.";
  const loc = p.conferenceLocation ? `, ${p.conferenceLocation}` : "";
  return `${a}, "${p.title}," in Proc. ${p.conferenceName}${loc}, ${citeYear(p)}${p.doi ? `, doi: ${p.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "")}` : ""}.`;
}

const bibEscape = (s: string) => s.replace(/([&%$#_{}])/g, "\\$1");

export function bibtex(p: CiteInput) {
  const first = parseName(p.authors[0] ?? "anon").last.toLowerCase().replace(/[^a-z0-9]/g, "");
  const word = (p.title.split(/\s+/).find((w) => w.length > 3) ?? "paper").toLowerCase().replace(/[^a-z0-9]/g, "");
  const authors = p.authors.map((a) => { const n = parseName(a); return n.firstNames ? `${n.last}, ${n.firstNames}` : n.last; }).join(" and ");
  const fields: [string, string][] = [
    ["author", authors],
    ["title", `{${bibEscape(p.title)}}`],
    ["booktitle", bibEscape(p.conferenceName)],
    ["year", citeYear(p)],
  ];
  if (p.conferenceLocation) fields.push(["address", bibEscape(p.conferenceLocation)]);
  if (p.doi) fields.push(["doi", p.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "")]);
  const body = fields.map(([k, v]) => `  ${k} = ${k === "title" || k === "year" ? v : `{${v}}`}`).join(",\n");
  return `@inproceedings{${first}${citeYear(p)}${word},\n${body}\n}`;
}

export function allCitations(p: CiteInput) {
  return { apa: apa(p), mla: mla(p), ieee: ieee(p), bibtex: bibtex(p) };
}
