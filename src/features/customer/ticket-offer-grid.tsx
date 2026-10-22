import { getSession } from "@/features/auth/session"
import { useI18n } from "@/features/preferences/i18n-provider"
import { formatMoney } from "@/lib/format"
import type { TicketOffer } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"

export function TicketOfferGrid({
  tickets,
  variant = "app",
}: {
  tickets: TicketOffer[]
  variant?: "app" | "landing"
}) {
  const { t } = useI18n()
  const signedIn =
    typeof window === "undefined" ? false : Boolean(getSession()?.accessToken)

  return (
    <div
      className={cn(
        "grid gap-2",
        variant === "landing"
          ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          : "grid-cols-3"
      )}
    >
      {tickets.map((ticket) => {
        const primaryPrice = ticket.prices.length > 0 ? ticket.prices[0] : undefined
        const priceLabel = primaryPrice
          ? formatMoney(primaryPrice.price, primaryPrice.currency)
          : t("tickets.noPrice")
        const extraPrices = ticket.prices.length > 1 ? ` +${ticket.prices.length - 1}` : ""

        const className = cn(
          "flex flex-col items-center rounded-2xl border px-2 py-3 text-center transition-colors",
          variant === "landing"
            ? "border-sky-500/20 bg-white hover:border-sky-500/45 hover:bg-sky-50/80"
            : "border-border/80 bg-muted/35 hover:border-primary/40 hover:bg-primary/5"
        )

        const body = (
          <>
            <p className="whitespace-nowrap font-heading text-base font-semibold tracking-wide tabular-nums">
              {ticket.number}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-primary">
              {priceLabel}
              {extraPrices}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
              {t(ticket.packSize === 1 ? "tickets.oneTicket" : "tickets.nTickets", {
                count: String(ticket.packSize),
              })}
            </p>
          </>
        )

        if (signedIn) {
          return (
            <Link
              key={ticket.id}
              to="/tickets/$ticketId"
              params={{ ticketId: ticket.id }}
              className={className}
            >
              {body}
            </Link>
          )
        }

        return (
          <Link key={ticket.id} to="/login" className={className}>
            {body}
          </Link>
        )
      })}
    </div>
  )
}
