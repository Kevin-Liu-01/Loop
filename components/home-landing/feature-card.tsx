type FeatureCardProps = {
  title: string;
  description: string;
  icon: string;
};

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/2 p-6 backdrop-blur-sm">
      <span className="mb-4 inline-block text-2xl text-[#e8650a]/50">{icon}</span>
      <h3 className="mb-2 font-serif text-lg font-medium text-white/90">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-white/40">{description}</p>
    </div>
  );
}
