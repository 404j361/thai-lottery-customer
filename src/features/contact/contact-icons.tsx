import type { ContactChannelId } from "@/features/contact/channels"
import { contactChannels } from "@/features/contact/channels"
import { cn } from "@/lib/utils"

const iconById = Object.fromEntries(contactChannels.map((c) => [c.id, c.iconSrc])) as Record<
  ContactChannelId,
  string
>

export function ContactChannelIcon({
  id,
  className,
  alt = "",
}: {
  id: ContactChannelId
  className?: string
  alt?: string
}) {
  return (
    <img
      src={iconById[id]}
      alt={alt}
      draggable={false}
      className={cn("size-7 shrink-0 object-contain", className)}
    />
  )
}
