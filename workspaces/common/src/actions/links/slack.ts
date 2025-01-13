import type { LinkActionHandler } from '@connectifi/sdk';
import { ContextTypes } from '@finos/fdc3';
import { RequestError, ServerError } from '../../types';
import { getSlackIDs } from '../../slack';

export const slackLink: LinkActionHandler = async (request) => {
  const apiKey = process.env.SLACK_API_KEY;
  if (!apiKey) {
    throw new ServerError('slack api key missing');
  }

  const { context } = request;
  if (context.type !== ContextTypes.Contact) {
    throw new RequestError('context type not supported');
  }

  const ids = await getSlackIDs(apiKey, context.id.email);
  const url = `slack://user?team=${ids.teamId}&id=${ids.userId}`;
  return { url };
};
