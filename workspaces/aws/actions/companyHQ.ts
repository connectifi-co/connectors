import type { ActionRequest } from "../../common/lib/types"
import { companyHQ } from "../../common/actions/links/companyHQ";

export async function handler(event:any) {

  const apiKey = process.env.POLYGON_API_KEY || '';

  const { context } = JSON.parse(event.body) as ActionRequest;

  return companyHQ({keys:{apiKey}, context});
}