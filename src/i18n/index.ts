import { en, type MessageTree } from "./messages/en"
import { my } from "./messages/my"
import { th } from "./messages/th"
import type { Locale } from "./languages"

const catalogs: Record<Locale, MessageTree> = { my, en, th }

type Primitive = string | number | boolean | null | undefined
type PathImpl<TTree, TKey extends keyof TTree> = TKey extends string
  ? TTree[TKey] extends Primitive
    ? TKey
    : TTree[TKey] extends Record<string, unknown>
      ? `${TKey}` | `${TKey}.${PathImpl<TTree[TKey], keyof TTree[TKey]>}`
      : TKey
  : never

export type MessageKey = PathImpl<MessageTree, keyof MessageTree>

function getByPath(tree: MessageTree, path: string): string | undefined {
  const parts = path.split(".")
  let current: unknown = tree
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === "string" ? current : undefined
}

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>) {
  const raw = getByPath(catalogs[locale], key) ?? getByPath(en, key) ?? key
  if (!vars) return raw
  return Object.entries(vars).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    raw
  )
}

export { catalogs }
