import { SKILL_HEADER_SHADER_EMBED_URL } from "@/lib/skill-header-shader";
import { cn } from "@/lib/cn";

type SkillHeaderShaderEmbedProps = {
  className?: string;
};

/**
 * Decorative Shader.com player in the skill detail header (top-left).
 * Pointer-events disabled so header links and buttons stay usable.
 */
export function SkillHeaderShaderEmbed({ className }: SkillHeaderShaderEmbedProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-0 top-0 z-0 h-[9.5rem] w-[13rem] motion-reduce:hidden sm:h-[11rem] sm:w-[15rem]",
        "mask-[radial-gradient(ellipse_95%_88%_at_0%_0%,#000_18%,transparent_70%)]",
        className
      )}
    >
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        className="h-[118%] w-[118%] -translate-x-[6%] -translate-y-[5%] border-0 opacity-[0.88] dark:opacity-[0.92]"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={SKILL_HEADER_SHADER_EMBED_URL}
        title=""
      />
    </div>
  );
}
