import { HomePage } from "@/features/customer/home"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/home")({ component: HomePage })
