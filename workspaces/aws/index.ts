import { createResponse } from '../common/lib/utils';

export async function handler() {
  return createResponse(200, {
    status: 'OK',
  });
}
