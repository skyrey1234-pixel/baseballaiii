import { base44 } from "@/api/base44Client";

export const AGENTS = ["Pitching AI", "Hitting AI", "Defense AI", "Baserunning AI", "Fatigue AI", "Injury-Risk AI", "Scouting AI", "Game Theory AI"];

const SCHEMA = {
  type: "object",
  properties: {
    agents: { type: "array", items: { type: "object", properties: { agent: { type: "string" }, opinion: { type: "string" }, stance: { type: "string", enum: ["for", "against", "neutral"] } } } },
    recommendation: { type: "string" },
    confidence: { type: "string", enum: ["low", "moderate", "high"] },
    options: { type: "array", items: { type: "object", properties: { decision: { type: "string" }, win_probability: { type: "number" } } } },
    reasoning: { type: "string" },
  },
};

export function rosterContext(players) {
  return (players || []).map((p) =>
    `${p.name} (#${p.number}, ${p.position}, ${p.key_stat}) — readiness ${p.readiness}/100, fatigue ${p.muscular_fatigue}, mechanics ${p.mechanical_stability}, command risk ${p.command_risk}${p.drift_notes?.length ? `, drift: ${p.drift_notes.join("; ")}` : ""}`
  ).join("\n");
}

export function gameContext(game) {
  return game
    ? `vs ${game.opponent}, ${game.half} of inning ${game.inning}, score us ${game.our_score} — them ${game.their_score}, ${game.outs} outs, count ${game.balls}-${game.strikes}, runners on: ${(game.runners || []).join(", ") || "none"}. Pitcher: ${game.current_pitcher}. Opposing batter: ${game.current_batter}. ${game.notes || ""}`
    : "No live game — treat as a realistic simulated situation.";
}

// Runs the 8-agent debate and persists the resulting Decision.
export async function runWarRoom({ question, game, roster, filmIntel, extra = "" }) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are the DiamondMind AI War Room — eight specialized baseball coaching agents who debate a decision, after which a head AI issues one final recommendation.

Agents (use these exact names): ${AGENTS.join(", ")}.

Game context: ${game}

Roster intelligence:
${roster}

${filmIntel || ""}
${extra}
Coach's question: "${question}"

Each of the 8 agents gives one sharp, quantitative opinion (1-2 sentences, referencing concrete signals like mechanical drift, matchup splits, win probability, workload, and anything drawn from the game film above) and a stance: "for", "against", or "neutral" toward the eventual recommendation. Then produce the final recommendation, a confidence level, 2-4 decision options each with an estimated win probability (integers, realistic 40-70 range), and a clear plain-language reasoning paragraph explaining WHY.`,
    response_json_schema: SCHEMA,
  });

  await base44.entities.Decision.create({
    question,
    recommendation: res.recommendation,
    confidence: res.confidence,
    reasoning: res.reasoning,
    options: res.options,
    agents: res.agents,
  });

  return res;
}