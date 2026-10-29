import type { ReactNode } from 'react';
import { MetalFx } from 'metal-fx';

/** Every way out to Google Play wears the same liquid-metal ring. */
export default function PlayButton({
  href,
  children,
  small,
  preset = 'chromatic',
}: {
  href: string;
  children: ReactNode;
  small?: boolean;
  preset?: 'chromatic' | 'silver' | 'gold';
}) {
  return (
    <MetalFx variant="button" preset={preset} theme="dark" className="play-wrap">
      <a className={`play${small ? ' play--small' : ''}`} href={href} target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M4.2 2.6c-.3.3-.4.7-.4 1.2v16.4c0 .5.1.9.4 1.2l.1.1 9.2-9.2v-.6L4.3 2.5l-.1.1Z" />
          <path fill="currentColor" opacity=".7" d="m16.6 15.4-3.1-3.1v-.6l3.1-3.1.1.1 3.6 2.1c1 .6 1 1.6 0 2.2l-3.6 2.1-.1.3Z" />
          <path fill="currentColor" opacity=".85" d="M16.7 15.3 13.5 12l-9.3 9.4c.4.4.9.4 1.6.1l10.9-6.2" />
          <path fill="currentColor" opacity=".55" d="M16.7 8.7 5.8 2.5c-.7-.4-1.2-.3-1.6.1l9.3 9.4 3.2-3.3Z" />
        </svg>
        <span>{children}</span>
      </a>
    </MetalFx>
  );
}
