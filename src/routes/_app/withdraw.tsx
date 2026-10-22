import { WithdrawPage } from "@/features/customer/withdraw"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/withdraw")({ component: WithdrawPage })
