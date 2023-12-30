import type { Context as FDC3Context } from "@finos/fdc3";
import { awsResponse } from "./utils";

export const slackPostToChannelHook = async (
  apiKey: string,
  context: FDC3Context,
  destinations: string[]
) => {
  const channelName = "app-tests";
  let channelId = "";
  const buildRequest = (
    api: string,
    body: Array<Array<string>>
  ): { url: string; config: any } => {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${apiKey}`,
    };

    const url = `https://slack.com/api/${api}`;
    const formBody: Array<string> = [];
    body.forEach((pair) => {
      formBody.push(
        `${encodeURIComponent(pair[0])}=${encodeURIComponent(pair[1])}`
      );
    });
    console.log(`posting to slack ${JSON.stringify(formBody)}`);
    return {
      url,
      config: { method: "POST", headers, body: formBody.join("&") },
    };
  };

  //look up the channel
  const channelsReq = buildRequest("conversations.list", [
    ["exclude_archived", "true"],
  ]);

  const channelsFetch = await fetch(channelsReq.url, channelsReq.config);
  if (channelsFetch.ok) {
    const channelsJson: any = await channelsFetch.json();
    console.log(`slack response, channels:  ${JSON.stringify(channelsJson)}`);
    //iterate through the list and see if the named channel is there and get it's id
    const channels: Array<any> = channelsJson.channels;
    const theChannel = channels.find((channel: any) => {
      return channel.name === channelName;
    });
    if (theChannel) {
      channelId = theChannel.id;
    } else {
      console.log('****** Channel not found');
      //create channel
      const createChannelReq = buildRequest("conversations.create", [
        ["name", channelName],
        ["is_private", "false"],
      ]);
      const createChannelFetch = await fetch(
        createChannelReq.url,
        createChannelReq.config
      );
      if (createChannelFetch.ok) {
        const createChannelJson: any = await createChannelFetch.json();
        console.log(
          `slack response, create channel:  ${JSON.stringify(
            createChannelJson
          )}`
        );
        //iterate through the list and see if the named channel is there and get it's id
        const channel: any = channelsJson.channel;
        channelId = channel?.id;
      }
    }
  }

  if (channelId) {
    const postReq = buildRequest("chat.postMessage", [
      ["channel", channelId],
      ["text", `Hello World ${JSON.stringify(context)}`],
    ]);
    const res = await fetch(postReq.url, postReq.config);
    if (res.ok) {
      const resJson: any = await res.json();
      console.log(`slack response ${JSON.stringify(resJson)}`);
    }
    const changes = destinations.map((destination) => ({
      destination,
      context: context,
    }));
    return awsResponse(200, changes);
  }
  return awsResponse(400, {
    message: "channel could not be found or created",
  });
};
