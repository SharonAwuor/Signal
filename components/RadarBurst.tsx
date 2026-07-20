import { Risk, RISK_META } from "./ui";

export default function RadarBurst({ risk = "clear" }: { risk?: Risk }) {
  const meta = RISK_META[risk];
  const Icon = meta.Icon;
  return (
    <div className="relative w-[84px] h-[84px] flex-shrink-0">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute inset-0 rounded-full opacity-0 animate-ring"
          style={{ border: `2px solid ${meta.color}`, animationDelay: `${i * 0.35}s` }}
        />
      ))}
      <div
        className="absolute inset-3.5 rounded-full flex items-center justify-center"
        style={{ background: `${meta.color}1f`, border: `1.5px solid ${meta.color}66` }}
      >
        <Icon size={26} color={meta.color} strokeWidth={2.2} />
      </div>
    </div>
  );
}
