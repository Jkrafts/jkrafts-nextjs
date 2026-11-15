// Single source of truth for navigation, contact details and social links,
// shared by the header, footer, contact page and closing call to action.

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const contact = {
  email: "info@jkrafts.com",
  phoneDisplay: "+44 7413 049561",
  whatsapp: "https://wa.me/447413049561",
} as const;

export type SocialIcon = "github" | "linkedin" | "x" | "facebook";

export const socials: { label: string; handle: string; href: string; icon: SocialIcon }[] = [
  { label: "GitHub", handle: "mfalm3", href: "https://github.com/mfalm3", icon: "github" },
  { label: "LinkedIn", handle: "joe-waithaka", href: "https://www.linkedin.com/in/joe-waithaka/", icon: "linkedin" },
  { label: "X", handle: "@_mfalm3", href: "https://x.com/_mfalm3", icon: "x" },
  { label: "Facebook", handle: "jkrafts7", href: "https://www.facebook.com/jkrafts7", icon: "facebook" },
];
