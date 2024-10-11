import type { ActionRequest } from "../../common/lib/types"
import { emailLink } from "../../common/actions/links/emailLink";

export async function handler(event:any) {
  const { context } = JSON.parse(event.body) as ActionRequest;

  return emailLink({context});
}