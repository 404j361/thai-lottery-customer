import { TicketDetailPage } from "@/features/customer/ticket-detail"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/tickets_/$ticketId")({
  component: TicketDetailRoute,
})

function TicketDetailRoute() {
  const { ticketId } = Route.useParams()
  return <TicketDetailPage ticketId={ticketId} />
}
