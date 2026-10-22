import { HistoryPage } from "@/features/customer/history"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/history")({ component: HistoryPage })
