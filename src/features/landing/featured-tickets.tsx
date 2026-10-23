import { LotteryTicketCard } from "@/features/customer/lottery-ticket-card"
import type { TicketOffer } from "@/lib/types"

export function FeaturedTickets({ tickets }: { tickets: TicketOffer[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => (
        <LotteryTicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}
