import { apiRequest } from "@/lib/api"
import type {
  DepositBank,
  Draw,
  DrawStatus,
  PaymentMethod,
  ResultsRange,
  PurchaseTicketBody,
  TicketFilters,
  TicketOffer,
  TicketPurchase,
  TransactionFilters,
  UpdateProfileBody,
  UserBalance,
  UserBank,
  UserProfile,
  WalletSummary,
  WalletTransaction,
} from "@/lib/types"

function withQuery(path: string, filters?: Record<string, string | undefined>) {
  if (!filters) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value)
  }
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export const customerApi = {
  profile: () => apiRequest<UserProfile>("/api/v1/users/profile"),
  updateProfile: (body: UpdateProfileBody) =>
    apiRequest<UserProfile>("/api/v1/users/profile", { method: "PATCH", body: JSON.stringify(body) }),
  getBank: () => apiRequest<UserBank | null>("/api/v1/users/bank"),
  createBank: (body: { bankName: string; accountName: string; accountNumber: string }) =>
    apiRequest<UserBank>("/api/v1/users/bank", { method: "POST", body: JSON.stringify(body) }),
  updateBank: (body: Partial<{ bankName: string; accountName: string; accountNumber: string }>) =>
    apiRequest<UserBank>("/api/v1/users/bank", { method: "PATCH", body: JSON.stringify(body) }),
  deleteBank: () => apiRequest<{ id: string; deleted: boolean }>("/api/v1/users/bank", { method: "DELETE" }),

  wallets: () => apiRequest<WalletSummary[]>("/api/v1/wallets"),
  paymentMethods: () => apiRequest<PaymentMethod[]>("/api/v1/payment-methods"),

  balances: () => apiRequest<UserBalance[]>("/api/v1/wallet/balance"),
  depositBanks: (walletId?: string) =>
    apiRequest<DepositBank[]>(withQuery("/api/v1/wallet/deposit-banks", walletId ? { walletId } : undefined)),
  transactions: (filters?: TransactionFilters) =>
    apiRequest<WalletTransaction[]>(withQuery("/api/v1/wallet/transactions", filters)),
  deposit: (body: FormData) =>
    apiRequest<WalletTransaction>("/api/v1/wallet/deposit", { method: "POST", body }),
  withdraw: (body: { walletId: string; amount: number; note?: string }) =>
    apiRequest<WalletTransaction>("/api/v1/wallet/withdraw", { method: "POST", body: JSON.stringify(body) }),

  draws: (status?: DrawStatus) =>
    apiRequest<Draw[]>(withQuery("/api/v1/draws", status ? { status } : undefined)),
  draw: (id: string) => apiRequest<Draw>(`/api/v1/draws/${id}`),
  results: (range: ResultsRange = "latest") =>
    apiRequest<Draw[]>(withQuery("/api/v1/results", { range })),
  tickets: (filters?: TicketFilters) =>
    apiRequest<TicketOffer[]>(
      withQuery("/api/v1/tickets", {
        drawId: filters?.drawId,
        drawDate: filters?.drawDate,
        number: filters?.number,
        currency: filters?.currency,
      })
    ),
  ticket: (id: string) => apiRequest<TicketOffer>(`/api/v1/tickets/${id}`),
  purchaseTicket: (body: PurchaseTicketBody) =>
    apiRequest<TicketPurchase>("/api/v1/tickets/purchase", { method: "POST", body: JSON.stringify(body) }),
  purchases: () => apiRequest<TicketPurchase[]>("/api/v1/purchases"),
  purchase: (id: string) => apiRequest<TicketPurchase>(`/api/v1/purchases/${id}`),
  winningTickets: () => apiRequest<TicketPurchase[]>("/api/v1/tickets/winning"),
}
