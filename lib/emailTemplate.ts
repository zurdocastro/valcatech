// Merge-tag substitution for campaign emails — an admin writes
// {{first_name}}/{{last_name}}/{{full_name}} once in the campaign editor and
// each recipient gets their own value substituted in at send time.
export function renderEmailTemplate(text: string, customer: { firstName: string; lastName: string }): string {
  return text
    .replaceAll("{{first_name}}", customer.firstName)
    .replaceAll("{{last_name}}", customer.lastName)
    .replaceAll("{{full_name}}", `${customer.firstName} ${customer.lastName}`.trim());
}
