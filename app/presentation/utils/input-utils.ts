export function forceNumber(value: string): string {
  if (value === '') {
    return value;
  }

  const lastTypedCharacter = value.slice(-1);

  if (!/[0-9]/.test(lastTypedCharacter)) {
    return value.slice(0, -1);
  }

  return value;
}
