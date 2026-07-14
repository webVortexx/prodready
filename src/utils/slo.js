// Pure math for the SLO Error Budget tool. No React, no side effects —
// keeps SLOCalculator.jsx focused on rendering.

export const WINDOWS = [
  { id: "day",     label: "1 day",   minutes: 1440 },
  { id: "week",    label: "7 days",  minutes: 10080 },
  { id: "month",   label: "30 days", minutes: 43200 },
  { id: "quarter", label: "90 days", minutes: 129600 },
  { id: "year",    label: "365 days", minutes: 525600 },
];

export const TARGETS = [99, 99.5, 99.9, 99.95, 99.99, 99.999];

export function allowedDowntimeMinutes(targetPct, windowMinutes) {
  return (1 - targetPct / 100) * windowMinutes;
}

export function formatDuration(totalMinutes) {
  if (!isFinite(totalMinutes)) return "—";
  const sign = totalMinutes < 0 ? "-" : "";
  let m = Math.abs(totalMinutes);
  const days = Math.floor(m / 1440); m -= days * 1440;
  const hours = Math.floor(m / 60); m -= hours * 60;
  const mins = Math.floor(m); m -= mins;
  const secs = Math.round(m * 60);

  if (days > 0) return `${sign}${days}d ${hours}h`;
  if (hours > 0) return `${sign}${hours}h ${mins}m`;
  if (mins > 0) return `${sign}${mins}m ${secs}s`;
  return `${sign}${secs}s`;
}

/**
 * Compute error-budget burn state given a target SLO, a window, how far
 * into the window we are, and downtime consumed so far.
 * `burnRate` follows the standard definition: how many times faster than
 * sustainable the budget is being consumed (1.0 = exactly on pace to hit
 * zero right at the end of the window).
 */
export function computeBurn({ targetPct, windowMinutes, elapsedMinutes, downtimeMinutes }) {
  const budget = allowedDowntimeMinutes(targetPct, windowMinutes);
  const elapsed = Math.max(0, Math.min(elapsedMinutes || 0, windowMinutes));
  const consumed = Math.max(0, downtimeMinutes || 0);
  const remaining = budget - consumed;

  const elapsedFraction = windowMinutes > 0 ? elapsed / windowMinutes : 0;
  const consumedFraction = budget > 0 ? consumed / budget : (consumed > 0 ? Infinity : 0);
  const burnRate = elapsedFraction > 0 ? consumedFraction / elapsedFraction : null;

  const ratePerMinute = elapsed > 0 ? consumed / elapsed : 0;
  const minutesToExhaustion = ratePerMinute > 0 ? remaining / ratePerMinute : Infinity;
  const exhaustsBeforeWindowEnds = ratePerMinute > 0 && remaining > 0 && (elapsed + minutesToExhaustion) < windowMinutes;
  const alreadyExhausted = remaining <= 0;

  return { budget, consumed, remaining, elapsedFraction, consumedFraction, burnRate, minutesToExhaustion, exhaustsBeforeWindowEnds, alreadyExhausted };
}

export function burnStatus(burnRate, COLORS) {
  if (burnRate === null) return { label: "no time elapsed yet", color: COLORS.textFaint };
  if (burnRate <= 1) return { label: "within budget", color: COLORS.ok };
  if (burnRate <= 2) return { label: "trending over budget", color: COLORS.warn };
  return { label: "burning budget fast", color: COLORS.err };
}
