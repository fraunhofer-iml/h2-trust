export function getElementOrThrowError<T>(elements: T[], index: number, elementName: string): T {
  if (!elements[index]) {
    throw new Error(`Missing ${elementName} at index ${index}`);
  }

  return elements[index];
}
