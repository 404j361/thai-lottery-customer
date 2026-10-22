import { AccountPage } from "@/features/customer/account"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/account")({ component: AccountPage })
