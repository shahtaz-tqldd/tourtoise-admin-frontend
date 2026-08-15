const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatMonths = (months) => {
  if (!months?.length) return "N/A";
  if (months.length === 12) return "Anytime";

  const monthIndexes = [
    ...new Set(
      months
        .map((month) => Number(month))
        .filter((month) => Number.isInteger(month) && month >= 0 && month < 12),
    ),
  ].sort((a, b) => a - b);

  if (!monthIndexes.length) return "N/A";

  const ranges = [];
  let rangeStart = monthIndexes[0];
  let rangeEnd = monthIndexes[0];

  for (const month of monthIndexes.slice(1)) {
    if (month === rangeEnd + 1) {
      rangeEnd = month;
      continue;
    }

    ranges.push([rangeStart, rangeEnd]);
    rangeStart = month;
    rangeEnd = month;
  }

  ranges.push([rangeStart, rangeEnd]);

  return ranges
    .map(([start, end]) =>
      start === end
        ? monthLabels[start]
        : `${monthLabels[start]} - ${monthLabels[end]}`,
    )
    .join(", ");
};

export function normalizeMonths(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 0 && item < 12);
}

export const formatDuration = (hours) => {
  if (!hours) return "N/A";

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (!days) return `${hours} hr`;
  if (!remainingHours) return `${days} day${days > 1 ? "s" : ""}`;

  return `${days} day${days > 1 ? "s" : ""} ${remainingHours} hr`;
};
