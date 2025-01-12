import { ContextTypes } from '@finos/fdc3';
import { LinkActionHandler, RequestError, ServerError } from '../../types';
import { getSlackIDs } from '../../slack';

const apiKey = process.env.SLACK_API_KEY;

export const slackLink: LinkActionHandler = async (request) => {
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
