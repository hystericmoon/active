import { ThinkingOrb, type OrbState } from 'thinking-orbs';

export default function Loader({ label, state = 'working' }: { label: string; state?: OrbState }) {
  return (
    <div className="loader" role="status">
      <ThinkingOrb state={state} size={64} theme="dark" aria-label={label} />
      <span>{label}</span>
    </div>
  );
}
