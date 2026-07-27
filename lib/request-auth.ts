import { timingSafeEqual } from "node:crypto";

export function hasValidBearerToken(
  authorization: string | null,
  expectedSecret: string | undefined
): boolean {
  if (!authorization || !expectedSecret) {
    return false;
  }
  const prefix = "Bearer ";
  if (!authorization.startsWith(prefix)) {
    return false;
  }
  const actual = Buffer.from(authorization.slice(prefix.length));
  const expected = Buffer.from(expectedSecret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
