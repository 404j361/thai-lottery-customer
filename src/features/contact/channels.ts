export type ContactChannelId = "facebook" | "messenger" | "telegram" | "viber"

export type ContactChannel = {
  id: ContactChannelId
  labelKey: `contact.${ContactChannelId}`
  href: string
  iconSrc: string
}

/** Demo URLs — override with VITE_CONTACT_* env vars for production. */
export const contactChannels: ContactChannel[] = [
  {
    id: "facebook",
    labelKey: "contact.facebook",
    href: import.meta.env.VITE_CONTACT_FACEBOOK || "https://www.facebook.com/",
    iconSrc: "/contact/facebook.svg",
  },
  {
    id: "messenger",
    labelKey: "contact.messenger",
    href: import.meta.env.VITE_CONTACT_MESSENGER || "https://www.messenger.com/",
    iconSrc: "/contact/messenger.svg",
  },
  {
    id: "telegram",
    labelKey: "contact.telegram",
    href: import.meta.env.VITE_CONTACT_TELEGRAM || "https://t.me/",
    iconSrc: "/contact/telegram.svg",
  },
  {
    id: "viber",
    labelKey: "contact.viber",
    href: import.meta.env.VITE_CONTACT_VIBER || "https://www.viber.com/",
    iconSrc: "/contact/viber.svg",
  },
]
