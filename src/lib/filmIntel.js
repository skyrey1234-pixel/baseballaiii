// Turns analyzed game film into scouting context that other AI features can reason over.
export function analyzedFilms(films) {
  return (films || []).filter((f) => f.analysis);
}

export function buildFilmIntel(films) {
  const analyzed = analyzedFilms(films);
  if (!analyzed.length) return "";
  const body = analyzed
    .slice(0, 5)
    .map((f) => `FILM: ${f.title}${f.notes ? ` (coach notes: ${f.notes})` : ""}\n${f.analysis}`)
    .join("\n\n");
  return `Game film scouting intelligence — breakdowns of film the coach has loaded. Treat these as your primary scouting source and reference them explicitly where relevant:\n${body}\n`;
}