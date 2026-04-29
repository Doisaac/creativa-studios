import { Link } from 'react-router'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-soft transition group-hover:shadow-glow">
        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand to-brand/40 opacity-0 transition group-hover:opacity-100" />
        <svg
          viewBox="0 0 24 24"
          className="relative h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4z" />
          <circle cx="16.5" cy="16.5" r="3.5" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Creativa
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Studios
        </span>
      </span>
    </Link>
  )
}
