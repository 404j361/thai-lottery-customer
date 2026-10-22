import { DepositPage } from "@/features/customer/deposit"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/deposit")({ component: DepositPage })
