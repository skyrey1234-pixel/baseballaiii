// MLB Pitch Smart daily limits and required rest, by age group.
// Guidance only — always defer to the athlete's coach and medical staff.
const TABLE = [
  { max: 8, limit: 50, rest: [[20, 0], [35, 1], [49, 2], [50, 3]] },
  { max: 10, limit: 75, rest: [[20, 0], [35, 1], [49, 2], [65, 3], [66, 4]] },
  { max: 12, limit: 85, rest: [[20, 0], [35, 1], [49, 2], [65, 3], [66, 4]] },
  { max: 14, limit: 95, rest: [[20, 0], [35, 1], [49, 2], [65, 3], [66, 4]] },
  { max: 16, limit: 95, rest: [[30, 0], [45, 1], [60, 2], [75, 3], [76, 4]] },
  { max: 18, limit: 105, rest: [[30, 0], [45, 1], [60, 2], [75, 3], [76, 4]] },
  { max: 22, limit: 120, rest: [[30, 0], [45, 1], [60, 2], [75, 3], [76, 4]] },
];

export const groupFor = (age) => TABLE.find((g) => age <= g.max) || TABLE[TABLE.length - 1];

export const restRequired = (pitches, age) => {
  const g = groupFor(age);
  const hit = g.rest.find(([p]) => pitches <= p);
  return hit ? hit[1] : g.rest[g.rest.length - 1][1];
};

const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);

// Rolls all logged outings across every organization into one workload picture.
export function buildPassport(outings, age) {
  const throwing = (outings || []).filter((o) => o.pitches > 0);
  if (!throwing.length) return null;

  const sorted = [...throwing].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = new Date().toISOString().slice(0, 10);
  const last = sorted[0];
  const g = groupFor(age);

  const within = (days) => sorted.filter((o) => daysBetween(o.date, today) < days);
  const sum = (list) => list.reduce((n, o) => n + (o.pitches || 0), 0);

  const restNeeded = restRequired(last.pitches, age);
  const restTaken = daysBetween(last.date, today);
  const clearedOn = new Date(new Date(last.date).getTime() + restNeeded * 86400000).toISOString().slice(0, 10);

  const orgs = [...new Set(throwing.map((o) => o.organization).filter(Boolean))];
  const alerts = [];

  if (restTaken < restNeeded) {
    alerts.push({ level: "high", text: `Rest incomplete — ${last.pitches} pitches on ${last.date} requires ${restNeeded} day${restNeeded === 1 ? "" : "s"} of rest. Cleared ${clearedOn}.` });
  }
  if (last.pitches > g.limit) {
    alerts.push({ level: "high", text: `Last outing exceeded the ${g.limit}-pitch daily limit for this age group.` });
  }
  if (sum(within(7)) > g.limit * 2) {
    alerts.push({ level: "moderate", text: `${sum(within(7))} pitches in the last 7 days across ${orgs.length || 1} organization${orgs.length === 1 ? "" : "s"} — heavy weekly volume.` });
  }
  const multiDay = within(2).length > 1;
  if (multiDay) alerts.push({ level: "moderate", text: "Threw for more than one program within 48 hours — confirm both coaches know the totals." });

  const sore = within(14).filter((o) => o.discomfort && o.discomfort !== "none");
  if (sore.length) alerts.push({ level: "high", text: `${sore.length} outing${sore.length === 1 ? "" : "s"} with reported discomfort in the last 14 days.` });

  return {
    last, restNeeded, restTaken, clearedOn, orgs,
    dailyLimit: g.limit,
    cleared: restTaken >= restNeeded,
    last7: sum(within(7)),
    last30: sum(within(30)),
    season: sum(sorted),
    alerts,
  };
}