// Scores how well a claimed measurement is backed by evidence.
const DEVICE_TRUST = {
  trackman: 30, hawkeye: 30, rapsodo: 26, blast_motion: 24,
  stalker_radar: 22, pocket_radar: 16, hand_timed: 8, estimated: 0,
};

const DEVICE_LABEL = {
  trackman: "TrackMan", hawkeye: "Hawk-Eye", rapsodo: "Rapsodo", blast_motion: "Blast Motion",
  stalker_radar: "Stalker radar", pocket_radar: "Pocket radar", hand_timed: "Hand timed", estimated: "Estimated",
};

export const deviceLabel = (d) => DEVICE_LABEL[d] || d;

export function scoreClaim(c) {
  const gaps = [];
  let score = DEVICE_TRUST[c.device] ?? 0;
  if ((DEVICE_TRUST[c.device] ?? 0) < 16) gaps.push("Measured with a low-precision method");

  if (c.video_url) score += 22; else gaps.push("No video of the measured rep");
  if (c.average_value) score += 16; else gaps.push("No session average — a single peak number can be an outlier");
  if (c.sample_size >= 10) score += 14;
  else if (c.sample_size >= 3) score += 7;
  else gaps.push("Fewer than 3 measurements in the session");
  if (c.setting === "game") score += 10;
  else if (c.setting === "showcase") score += 6;
  if (c.witness) score += 8; else gaps.push("No third-party witness on record");

  score = Math.min(100, score);
  const tier = score >= 80 ? "verified" : score >= 55 ? "supported" : score >= 30 ? "unconfirmed" : "unsupported";
  return { score, tier, gaps };
}

export const TIER_STYLE = {
  verified: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  supported: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  unconfirmed: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  unsupported: "border-rose-400/40 bg-rose-500/10 text-rose-200",
};