import type { languages } from "@/i18n/languages"

type FlagCode = (typeof languages)[number]["flag"]

export function CountryFlag({ code, className = "size-5" }: { code: FlagCode; className?: string }) {
  switch (code) {
    case "mm":
      return (
        <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
          <rect width="36" height="24" rx="3" fill="#FECB00" />
          <rect y="8" width="36" height="8" fill="#34B233" />
          <rect y="16" width="36" height="8" fill="#EA2839" />
          <polygon
            fill="#FFF"
            points="18,6.2 19.4,10.2 23.6,10.2 20.2,12.7 21.5,16.7 18,14.2 14.5,16.7 15.8,12.7 12.4,10.2 16.6,10.2"
          />
        </svg>
      )
    case "gb":
      return (
        <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
          <rect width="36" height="24" rx="3" fill="#012169" />
          <path d="M0 0 L36 24 M36 0 L0 24" stroke="#FFF" strokeWidth="4" />
          <path d="M0 0 L36 24 M36 0 L0 24" stroke="#C8102E" strokeWidth="2" />
          <path d="M18 0 V24 M0 12 H36" stroke="#FFF" strokeWidth="7" />
          <path d="M18 0 V24 M0 12 H36" stroke="#C8102E" strokeWidth="4" />
        </svg>
      )
    case "th":
      return (
        <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
          <rect width="36" height="24" rx="3" fill="#A51931" />
          <rect y="4" width="36" height="16" fill="#F4F5F8" />
          <rect y="8" width="36" height="8" fill="#2D2A4A" />
        </svg>
      )
  }
}
