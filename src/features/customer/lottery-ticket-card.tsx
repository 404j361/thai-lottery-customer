import { getSession } from "@/features/auth/session"
import { useI18n } from "@/features/preferences/i18n-provider"
import { formatMoney } from "@/lib/format"
import type { TicketOffer } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"

function TicketFace({
  ticket,
  priceLabel,
  currency,
  cta,
  compact,
}: {
  ticket: TicketOffer
  priceLabel: string
  currency: string
  cta: string
  compact: boolean
}) {
  const { t } = useI18n()
  const digits = ticket.number.split("")

  return (
    <article className={cn("lottery-ticket group", compact && "lottery-ticket--compact")}>
      <div className="lottery-ticket-stub" aria-hidden>
        <img
          src="/brand/pyit-tine-htaung.png"
          alt=""
          className={cn("rounded-full bg-white object-contain", compact ? "size-6" : "size-8")}
        />
        <span className="lottery-ticket-stub-text">
          {t(ticket.packSize === 1 ? "tickets.oneTicket" : "tickets.nTickets", {
            count: String(ticket.packSize),
          })}
        </span>
      </div>

      <div className="lottery-ticket-perforation" aria-hidden>
        {Array.from({ length: compact ? 7 : 9 }).map((_, index) => (
          <span key={index} className="lottery-ticket-hole" />
        ))}
      </div>

      <div className="lottery-ticket-body">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <p
              className={cn(
                "font-heading font-semibold text-[#8b1e2d] uppercase",
                compact ? "truncate text-[0.55rem] tracking-[0.14em]" : "text-[0.65rem] tracking-[0.22em]"
              )}
            >
              {t("appName")}
            </p>
            {compact ? null : <p className="mt-0.5 text-[0.7rem] text-slate-500">{t("tickets.number")}</p>}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-sm border border-[#c9a227]/50 bg-[#fff6d6] font-semibold tracking-wide text-[#7a5b00]",
              compact ? "px-1 py-px text-[0.55rem]" : "px-1.5 py-0.5 text-[0.65rem]"
            )}
          >
            {currency}
          </span>
        </div>

        <div className={cn("lottery-ticket-digits", compact ? "mt-2" : "mt-3")} aria-label={ticket.number}>
          {digits.map((digit, index) => (
            <span key={`${ticket.id}-${index}`} className="lottery-ticket-digit">
              {digit}
            </span>
          ))}
        </div>

        <div className={cn("flex items-end justify-between gap-2", compact ? "mt-2.5" : "mt-4")}>
          <div className="min-w-0">
            {compact ? null : (
              <p className="text-[0.65rem] font-medium tracking-wide text-slate-500 uppercase">
                {t("landing.packPrice")}
              </p>
            )}
            <p
              className={cn(
                "font-heading font-bold text-[var(--wave-to)] tabular-nums",
                compact ? "truncate text-sm" : "mt-0.5 text-lg"
              )}
            >
              {priceLabel}
            </p>
          </div>
          <span className="lottery-ticket-cta">{cta}</span>
        </div>
      </div>
    </article>
  )
}

export function LotteryTicketCard({
  ticket,
  guestCta,
  compact = false,
}: {
  ticket: TicketOffer
  /** CTA when signed out (landing). Defaults to sign-in label. */
  guestCta?: string
  /** Smaller face for 2-up grids in the app shell. */
  compact?: boolean
}) {
  const { t } = useI18n()
  const signedIn =
    typeof window === "undefined" ? false : Boolean(getSession()?.accessToken)
  const primaryPrice = ticket.prices[0]
  const priceLabel = primaryPrice
    ? formatMoney(primaryPrice.price, primaryPrice.currency)
    : t("tickets.noPrice")
  const currency = primaryPrice?.currency ?? "MMK"
  const cta = signedIn ? t("tickets.buy") : (guestCta ?? t("landing.ticketsSignInToBuy"))
  const face = (
    <TicketFace
      ticket={ticket}
      priceLabel={priceLabel}
      currency={currency}
      cta={cta}
      compact={compact}
    />
  )

  if (signedIn) {
    return (
      <Link
        to="/tickets/$ticketId"
        params={{ ticketId: ticket.id }}
        className="block min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {face}
      </Link>
    )
  }

  return (
    <Link
      to="/login"
      className="block min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {face}
    </Link>
  )
}
