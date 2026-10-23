import { LotteryTicketCard } from "@/features/customer/lottery-ticket-card"
import type { TicketOffer } from "@/lib/types"
import { cn } from "@/lib/utils"

export function TicketOfferGrid({
  tickets,
  variant = "app",
}: {
  tickets: TicketOffer[]
  variant?: "app" | "landing"
}) {
  const compact = variant === "app"

  return (
    <div
      className={cn(
        "grid gap-3",
        variant === "landing" ? "gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-2"
      )}
    >
      {tickets.map((ticket) => (
        <LotteryTicketCard key={ticket.id} ticket={ticket} compact={compact} />
      ))}
    </div>
  )
}
