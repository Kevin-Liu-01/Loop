/**
 * Skill detail hero: Shader.com iframe source.
 * Override when Shader’s embed URL differs from the public view URL.
 */
export const SKILL_HEADER_SHADER_EMBED_URL =
  typeof process.env.NEXT_PUBLIC_SKILL_HEADER_SHADER_EMBED_URL === "string" &&
  process.env.NEXT_PUBLIC_SKILL_HEADER_SHADER_EMBED_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_SKILL_HEADER_SHADER_EMBED_URL.trim()
    : "https://www.shader.com/view/4dfYs3";
