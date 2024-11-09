import type { ActionRequest } from "../../common/lib/types"
import { mapLink } from "../../common/actions/links/mapLink";

export async function handler(event:any) {

  const { context } = JSON.parse(event.body) as ActionRequest;

  return mapLink({ context });
}