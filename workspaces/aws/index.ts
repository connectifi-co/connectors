import { createResponse } from "../common/lib/utils";

export async function handler(event:any) {
  return createResponse(200, {
    message: 'Connectifi Hooks!',
    input: event,
  });
}