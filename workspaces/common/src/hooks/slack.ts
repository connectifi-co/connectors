import { ContextTypes } from '@finos/fdc3';
import type { DeliveryHookHandler } from '@connectifi/sdk';
import { RequestError, ServerError } from '../types';
import { getSlackIDs } from '../slack';

const apiKey = process.env.SLACK_API_KEY;

// should probably revisit this - doesn't make a lot of sense as a delivery hook

export const slackHook: DeliveryHookHandler = async (request) => {
  if (!apiKey) {
    throw new ServerError('slack api key missing');
  }

  const { context } = request;
  if (context.type !== ContextTypes.Contact) {
    throw new RequestError('context type not supported');
  }

  const slackIDs = await getSlackIDs(apiKey, context.id.email);
  const newCtx = {
    ...context,
    slackUserId: slackIDs.userId,
    slackTeamId: slackIDs.teamId,
  };
  return { context: newCtx };
};
