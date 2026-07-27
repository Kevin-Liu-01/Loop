export const SKILL_TITLE_MAX_LENGTH = 60;
export const SKILL_DESCRIPTION_MAX_LENGTH = 400;
export const AUTOMATION_NAME_MAX_LENGTH = 60;
export const AUTOMATION_PROMPT_MAX_LENGTH = 600;

/** Truncate a string at a word boundary when possible. */
export function clampField(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  const cut = value.lastIndexOf(" ", max - 1);
  const end = cut > max * 0.4 ? cut : max - 1;
  return `${value.slice(0, end).trimEnd()}…`;
}
