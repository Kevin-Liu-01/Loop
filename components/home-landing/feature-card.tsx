import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/2 p-6 backdrop-blur-sm">
      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-[#e8650a]/60">
        {icon}
      </span>
      <h3 className="mb-2 font-serif text-lg font-medium text-white/90">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-white/40">{description}</p>
    </div>
  );
}
