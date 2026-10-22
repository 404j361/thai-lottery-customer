import { ResultsPage } from "@/features/customer/results"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/results")({ component: ResultsPage })
