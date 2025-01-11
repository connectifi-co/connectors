import { createResponse } from '../common/utils';

export async function handler() {
  return createResponse(200, {
    status: 'OK',
  });
}
