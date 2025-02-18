import { WebClient } from '@slack/web-api';
import { ServerError, Channel, List } from '../../../types';


export interface SlackChannel {
    "id": string;
    "name": string;
    "is_channel": boolean;
    "is_group": boolean;
    "is_im": boolean;
    "created": number;
    "creator": string;
    "is_archived": boolean;
    "is_general": boolean;
}

export const getSlackChannels = async (apiKey: string): Promise<SlackChannel[]> => {
    const slack = new WebClient(apiKey);
    const channelsResponse = await slack.conversations.list();
    if (channelsResponse.ok) {
        return channelsResponse.channels.map((c) => {
            return {
                id: c.id,
                name: c.name,
                is_channel: c.is_channel,
                is_group: c.is_group,
                is_im: c.is_im,
                created: c.created,
                creator: c.creator,
                is_archived:  c.is_archived,
                is_general: c.is_general
            }
        });
    }
};

//getChannels
export const getChannels = async (apiKey:  string): Promise<List> => {
    const slackChannels = await getSlackChannels(apiKey);
    const channels: Array<Channel> = slackChannels.map((c) => {
        return {
            type: 'connect.channel',
            name: c.name,
            id: {
                slack:  c.id
            }
        } as Channel;
    });
    return {
        type: "connect.list",
        listType: "connect.channel",
        items: channels
    }
}

//getOrCreateChannel
export const getOrCreateChannel = async (apiKey:  string, name: string): Promise<Channel> => {
    let found: SlackChannel | undefined;
    const channels = await getSlackChannels(apiKey);
    found = channels.find((channel)=> {
        return (channel.name === name);
    });
    if (found){
        return  {
            name: found.name,
            id: {
                slack: found.id
            }
        } as Channel;
    }
    const slackAPI = new WebClient(apiKey);
    const channelResponse = await slackAPI.conversations.create({
        name: name
    });  
    if (channelResponse.ok){
        return  {
            name: channelResponse.channel.name,
            id: {
                slack: channelResponse.channel.id
            }
        } as Channel;
    }
    throw new ServerError('channel could not be found or created');
};
