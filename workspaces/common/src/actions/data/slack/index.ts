import { DataActionHandler } from '@connectifi/sdk';
import { postToContextChannel, postToChannel } from './messages';
import { getChannels, getOrCreateChannel } from './channels';
import { getUsers } from './users';
import { getMessageTargets } from './messages';
import { ServerError, RequestError, ChannelMessage } from '../../../types';

const apiKey = process.env.SLACK_API_KEY;

export const slackAPIHandler: DataActionHandler = async (params) => {
  if (!apiKey) {
    throw new ServerError('slack api key missing');
  }
  
  const { context, intent } = { ...params };

  if (intent === "PostToChannel") {
    //if context is to post to a specific channel
    if (context.type === "connect.channelMessage"){
      const result = await postToChannel(apiKey, context as ChannelMessage);
      return result;
    }
    //default to generic channel posting
    const result = await postToContextChannel(apiKey, context);
    return result;
  }

  if (intent == "GetChannels"){
    return await getChannels(apiKey);
  }

  if (intent === "GetOrCreateChannel"){
    return await getOrCreateChannel(apiKey, context.name);
  }

  if (intent === "GetUsers"){
    return await getUsers(apiKey);
  }

  if (intent === "GetMessageTargets"){
    return await getMessageTargets(apiKey);
  }

  throw new RequestError('intent not supported');
};