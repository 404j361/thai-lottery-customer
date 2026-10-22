import { Link } from "@tanstack/react-router"

import { getSession } from "@/features/auth/session"
import { useI18n } from "@/features/preferences/i18n-provider"
import { formatMoney } from "@/lib/format"
import type { TicketOffer } from "@/lib/types"

function TicketFace({
  ticket,
  priceLabel,
  currency,
  cta,
}: {
  ticket: TicketOffer
  priceLabel: string
  currency: string
  cta: string
}) {
  const { t } = useI18n()
  const digits = ticket.number.split("")

  return (
    <article className="lottery-ticket group">
      <div className="lottery-ticket-stub" aria-hidden>
        <img src="/brand/pyit-tine-htaung.png" alt="" className="size-8 rounded-full bg-white object-contain" />
        <span className="lottery-ticket-stub-text">
          {t(ticket.packSize === 1 ? "tickets.oneTicket" : "tickets.nTickets", {
            count: String(ticket.packSize),
          })}
        </span>
      </div>

      <div className="lottery-ticket-perforation" aria-hidden>
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} className="lottery-ticket-hole" />
        ))}
      </div>

      <div className="lottery-ticket-body">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-heading text-[0.65rem] font-semibold tracking-[0.22em] text-[#8b1e2d] uppercase">
              {t("appName")}
            </p>
            <p className="mt-0.5 text-[0.7rem] text-slate-500">{t("tickets.number")}</p>
          </div>
          <span className="rounded-sm border border-[#c9a227]/50 bg-[#fff6d6] px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-[#7a5b00]">
            {currency}
          </span>
        </div>

        <div className="lottery-ticket-digits mt-3" aria-label={ticket.number}>
          {digits.map((digit, index) => (
            <span key={`${ticket.id}-${index}`} className="lottery-ticket-digit">
              {digit}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-medium tracking-wide text-slate-500 uppercase">
              {t("landing.packPrice")}
            </p>
            <p className="mt-0.5 font-heading text-lg font-bold text-[#0c2a56] tabular-nums">{priceLabel}</p>
          </div>
          <span className="lottery-ticket-cta">{cta}</span>
        </div>
      </div>
    </article>
  )
}

export function FeaturedTickets({ tickets }: { tickets: TicketOffer[] }) {
  const { t } = useI18n()
  const signedIn =
    typeof window === "undefined" ? false : Boolean(getSession()?.accessToken)

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => {
        const primaryPrice = ticket.prices[0]
        const priceLabel = primaryPrice
          ? formatMoney(primaryPrice.price, primaryPrice.currency)
          : t("tickets.noPrice")
        const currency = primaryPrice?.currency ?? "MMK"
        const cta = signedIn ? t("tickets.buy") : t("landing.ticketsSignInToBuy")
        const face = (
          <TicketFace ticket={ticket} priceLabel={priceLabel} currency={currency} cta={cta} />
        )

        if (signedIn) {
          return (
            <Link
              key={ticket.id}
              to="/tickets/$ticketId"
              params={{ ticketId: ticket.id }}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5bb5] focus-visible:ring-offset-2"
            >
              {face}
            </Link>
          )
        }

        return (
          <Link
            key={ticket.id}
            to="/login"
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5bb5] focus-visible:ring-offset-2"
          >
            {face}
          </Link>
        )
      })}
    </div>
  )
}
