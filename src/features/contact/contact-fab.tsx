import { contactChannels } from "@/features/contact/channels"
import { ContactChannelIcon } from "@/features/contact/contact-icons"
import { useI18n } from "@/features/preferences/i18n-provider"
import { cn } from "@/lib/utils"
import { MessageCircle, X } from "lucide-react"
import { useEffect, useId, useState } from "react"

/** Icon-center offsets from the FAB center (arc up / left). Radius ~118px, ~36° apart. */
const FAN = [
  { x: -118, y: -6 },
  { x: -102, y: -72 },
  { x: -58, y: -118 },
  { x: 2, y: -128 },
] as const

type ContactFabProps = {
  /** Extra bottom offset (e.g. clear the customer bottom nav). */
  offsetClassName?: string
}

export function ContactFab({ offsetClassName }: ContactFabProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-4 z-50 flex items-end justify-end",
        offsetClassName ?? "bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
      )}
    >
      {open ? (
        <button
          type="button"
          aria-label={t("close")}
          className="pointer-events-auto fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="pointer-events-none relative z-50 size-12">
        <div id={panelId} role="menu" aria-hidden={!open} className="absolute inset-0">
          {contactChannels.map((channel, index) => {
            const pos = FAN[index] ?? FAN[0]
            return (
              <a
                key={channel.id}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                tabIndex={open ? 0 : -1}
                aria-label={t(channel.labelKey)}
                onClick={() => setOpen(false)}
                className={cn(
                  "pointer-events-auto absolute top-1/2 left-1/2 size-9",
                  "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  open ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                style={{
                  transform: open
                    ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(1)`
                    : "translate(-50%, -50%) scale(0.35)",
                  transitionDelay: open ? `${50 + index * 50}ms` : `${(3 - index) * 25}ms`,
                }}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgb(0_0_0/0.2)] ring-1 ring-black/5">
                  <ContactChannelIcon id={channel.id} className="size-5" alt="" />
                </span>
                <span className="absolute top-[calc(100%+0.3rem)] left-1/2 w-max max-w-[4.5rem] -translate-x-1/2 truncate rounded-full bg-black/60 px-1.5 py-0.5 text-center text-[9px] font-semibold leading-none text-white">
                  {t(channel.labelKey)}
                </span>
              </a>
            )
          })}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? t("close") : t("account.contact")}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "pointer-events-auto absolute inset-0 z-10 flex size-12 items-center justify-center rounded-2xl",
            "bg-primary text-primary-foreground shadow-[0_10px_28px_var(--primary-glow)]",
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-90",
            open && "rotate-90"
          )}
        >
          <span className="relative flex size-5 items-center justify-center">
            <MessageCircle
              className={cn(
                "absolute size-5 transition-all duration-300",
                open ? "scale-50 rotate-45 opacity-0" : "scale-100 rotate-0 opacity-100"
              )}
            />
            <X
              className={cn(
                "absolute size-5 transition-all duration-300",
                open ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-45 opacity-0"
              )}
            />
          </span>
        </button>
      </div>
    </div>
  )
}
