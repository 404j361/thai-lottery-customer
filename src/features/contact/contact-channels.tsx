import { contactChannels } from "@/features/contact/channels"
import { ContactChannelIcon } from "@/features/contact/contact-icons"
import { useI18n } from "@/features/preferences/i18n-provider"
import { cn } from "@/lib/utils"

type ContactChannelsProps = {
  /** `onDark` for landing footer chrome; `card` for account settings. */
  variant?: "onDark" | "card"
  className?: string
}

export function ContactChannels({ variant = "card", className }: ContactChannelsProps) {
  const { t } = useI18n()
  const onDark = variant === "onDark"

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {contactChannels.map((channel) => (
        <a
          key={channel.id}
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t(channel.labelKey)}
          title={t(channel.labelKey)}
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-90",
            onDark ? "bg-white shadow-sm" : "bg-white shadow-sm ring-1 ring-border/70"
          )}
        >
          <ContactChannelIcon id={channel.id} className="size-8" alt="" />
        </a>
      ))}
    </div>
  )
}
