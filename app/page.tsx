import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/content";

// The marketing site lives under /[locale]; "/" is just the doorway. Static
// segments (/admin, /api) win over the dynamic one, so the backoffice is
// unaffected by the locale segment existing at the root.
export default function RootRedirect() {
  redirect(`/${DEFAULT_LOCALE}`);
}
