import { ReactNode } from "react";

export default function PullQuote({ children, cite }: { children: ReactNode; cite?: ReactNode }) {
  return (
    <figure>
      <span aria-hidden className="ed-serif block text-5xl leading-none text-[var(--ed-accent)]">
        &ldquo;
      </span>
      <blockquote className="ed-serif -mt-5 text-4xl italic leading-snug tracking-tight md:text-[3.8rem] font-semibold">{children}</blockquote>
      {cite && <figcaption className="mt-4 text-sm text-[var(--ed-text-muted)]">&mdash; {cite}</figcaption>}
    </figure>
  );
}
