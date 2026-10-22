import { BankPage } from "@/features/customer/bank"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/bank")({ component: BankPage })
