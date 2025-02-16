import { Context } from '@finos/fdc3';
import { ServerError, ChannelMessage, List, ChatMessage } from '../../../types';
import { WebClient } from '@slack/web-api';
import { getSlackChannels, getOrCreateChannel, SlackChannel, getChannels } from './channels';
import { getUsers, decorateContact } from './users';

const codeMarkdown = '```';
export const contextToChannelName = (context: Context): string => {
  return context.type.replace(".", "-");
};

const formatMessage = (context: ChannelMessage | ChatMessage): string => {
  if (context.context){
    return `${context.message} ${codeMarkdown} ${JSON.stringify(context.context)} ${codeMarkdown}`;
  }
  return `${context.message}`;
};

//post messages to channels named for the context type
export const postToChannel = async (apiKey: string, context: ChannelMessage): Promise<Context> => {
  const formatMessage = (context: ChannelMessage): string => {
    if (context.context){
      return `${context.message} ${codeMarkdown} ${JSON.stringify(context.context)} ${codeMarkdown}`;
    }
    return `${context.message}`;
  };
  
  const slackAPI = new WebClient(apiKey);
  const channels = await  getSlackChannels(apiKey);
  let channel: SlackChannel | undefined;
  channel = channels.find((channel)=> {
        return (channel.name === context.channel.name);
  });
 
  if (channel) {
      await slackAPI.chat.postMessage({
        channel: channel.id,
        text: formatMessage(context)
      });
    return context;
  }

  throw new ServerError('channel could not be found');
};


//post dm to a contact
export const postToChat = async (apiKey: string, context: ChatMessage): Promise<Context> => {

  const slackAPI = new WebClient(apiKey);
  //decorate contact?
  if (!context.target.id.slack){
    const contact = await decorateContact(apiKey, context.target);
    context.target = contact;
  }

  if (context.target.id.slack) {
      await slackAPI.chat.postMessage({
        channel: context.target.id.slack,
        text: formatMessage(context)
      });
    return context;
  }

  throw new ServerError('contact could not be found');
};

//post messages to channels named for the context type
export const postToContextChannel = async (apiKey: string, context: Context): Promise<Context> => {
  const slackAPI = new WebClient(apiKey);
  const formatMessage = (context: Context): string => {
    return `*New Context Shared* ${codeMarkdown}${JSON.stringify(context)}${codeMarkdown}`
  };

  const channel = await getOrCreateChannel(apiKey, contextToChannelName(context));
  if (channel?.id?.slack) {
    await slackAPI.chat.postMessage({
      channel: channel.id.slack,
      text: formatMessage(context)
    });
    return context;
  }

    throw new ServerError('channel could not be found or created');
  };

  export const getMessageTargets = async (apiKey: string): Promise<List> => {
    const channels = await getChannels(apiKey);
    const users = await getUsers(apiKey);
    return {
      type: 'connect.list',
      listType: 'fdc3.context',
      items: [
        ...users.items,
        ...channels.items,
      ]
    };

  }