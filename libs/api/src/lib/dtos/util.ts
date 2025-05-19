export function parseColor(quality: string | undefined): string | undefined {
  if (!quality) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(quality);
    return parsed.color;
  } catch {
    return undefined;
  }
}
