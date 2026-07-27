export const LIBRARY_PATH = "/";
export const PUBLIC_HOME_PATH = "/home";
export const SIGN_IN_PATH = "/sign-in";
export const SIGN_UP_PATH = "/sign-up";

export const MARKETING_NAV_LINKS = [
  { href: `${PUBLIC_HOME_PATH}#skills`, label: "Skills" },
  { href: `${PUBLIC_HOME_PATH}#mcps`, label: "Automations" },
  { href: "/faq", label: "FAQ" },
] as const;

export const APP_NAV_LINKS = [
  { href: LIBRARY_PATH, label: "Library" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/settings", label: "Settings" },
] as const;

export function isLibraryPath(pathname: string): boolean {
  return pathname === LIBRARY_PATH;
}
