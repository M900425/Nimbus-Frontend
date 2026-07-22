export const toTitleCase = (str: string): string => {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const parseCoordinates = (
  str: string,
): { lat: number; lon: number } | null => {
  if (!str) return null;
  const match = str
    .trim()
    .match(/^([-+]?\d+\.?\d*)\s*[,;]\s*([-+]?\d+\.?\d*)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lon)) return null;
  return { lat, lon };
};
