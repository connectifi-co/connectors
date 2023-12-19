import { awsResponse } from "../common/utils";

export async function handler(event:any) {
  return awsResponse(200, {
    message: 'Connectifi Hooks!',
    input: event,
  });
}