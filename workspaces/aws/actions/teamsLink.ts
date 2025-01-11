import type { ActionRequest } from '../../common/types';
import { teamsLink } from '../../common/actions/links/teamsLink';

export async function handler(event: any) {
  const { context, intent } = JSON.parse(event.body) as ActionRequest;

  return teamsLink({ context, intent });
}
