export type Currency = "MMK" | "THB"
export type TransactionType = "DEPOSIT" | "WITHDRAW" | "PURCHASE"
export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
export type TransactionSource = "USER" | "ADMIN"

export type WalletSummary = {
  id: string
  currency: Currency
  name: string
}

export type PaymentMethodSummary = {
  id: string
  name: string
  code: string
  logo?: string | null
}

export type DepositBank = {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  imageQr: string | null
  paymentMethod: PaymentMethodSummary & {
    wallet: WalletSummary
  }
}

export type PaymentMethod = {
  id: string
  name: string
  code: string
  logo: string | null
  wallet: WalletSummary
  banks: Array<{
    id: string
    bankName: string
    accountName: string
    accountNumber: string
    imageQr: string | null
  }>
}

export type UserBalance = {
  id: string
  balance: string
  wallet: WalletSummary
  updatedAt: string
}

export type UserBank = {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  createdAt?: string
  updatedAt?: string
}

export type ColorTheme = "ocean" | "blood" | "green"
export type PreferenceLocale = "my" | "en" | "th"
export type Appearance = "light" | "dark" | "system"

export type UserPreferences = {
  colorTheme: ColorTheme
  locale: PreferenceLocale
  appearance: Appearance
}

export type UserProfile = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  createdAt: string
  updatedAt: string
  role?: { id: string; name: string; slug: string; isSystem: boolean } | null
  bank: UserBank | null
  /** Present on current API; treat as optional for older responses. */
  preferences?: UserPreferences
}

export type UpdateProfileBody = {
  firstName?: string
  lastName?: string
  preferences?: Partial<UserPreferences>
}

export type WalletTransaction = {
  id: string
  type: TransactionType
  status: TransactionStatus
  source: TransactionSource
  amount: string
  balanceBefore: string | null
  balanceAfter: string | null
  receiptUrl: string | null
  reference: string | null
  destBankName: string | null
  destAccountName: string | null
  destAccountNumber: string | null
  note: string | null
  rejectReason: string | null
  reviewedAt: string | null
  wallet: WalletSummary
  paymentMethodBank?: DepositBank | null
  reviewedBy?: { id: string; email: string } | null
  createdAt: string
  updatedAt: string
}

export type TransactionFilters = {
  type?: TransactionType
  status?: TransactionStatus
  walletId?: string
}

export type DrawStatus = "DRAFT" | "OPEN" | "CLOSED" | "DRAWN"
export type TicketOfferStatus = "AVAILABLE" | "SOLD_OUT" | "DISABLED"
export type PurchaseStatus = "COMPLETED" | "REFUNDED"

export type DrawPrizeGroup = {
  price: string
  numbers: string[]
}

export type DrawResults = {
  source: "GLO"
  date: string
  displayDate?: string
  pdfUrl?: string
  youtubeUrl?: string
  prizes: {
    first: DrawPrizeGroup
    near1: DrawPrizeGroup
    second: DrawPrizeGroup
    third: DrawPrizeGroup
    fourth: DrawPrizeGroup
    fifth: DrawPrizeGroup
    last3Front: DrawPrizeGroup
    last3Back: DrawPrizeGroup
    last2: DrawPrizeGroup
  }
}

export type ResultsRange = "latest" | "month" | "3months" | "6months"

export type Draw = {
  id: string
  name: string
  drawDate: string
  status: DrawStatus
  winningNumber?: string | null
  results?: DrawResults | null
  note?: string | null
}

export type TicketPrice = {
  walletId: string
  currency: Currency
  walletName: string
  price: string
}

export type TicketOffer = {
  id: string
  drawId: string
  number: string
  packSize: number
  quantity: number
  status: TicketOfferStatus
  prices: TicketPrice[]
  draw?: Draw
}

export type TicketFilters = {
  drawId?: string
  drawDate?: string
  number?: string
  currency?: Currency
}

export type TicketPurchase = {
  id: string
  drawId: string
  ticketId?: string | null
  walletId: string
  number: string
  packSize: number
  quantity: number
  unitPrice: string
  totalAmount: string
  status: PurchaseStatus
  isWinner: boolean
  draw?: Draw
  wallet?: WalletSummary
  createdAt: string
}

export type PurchaseTicketBody = {
  ticketId: string
  walletId: string
  quantity: number
}
