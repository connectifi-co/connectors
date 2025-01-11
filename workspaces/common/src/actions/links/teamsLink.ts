import {
  type Context,
  ContextTypes,
  type Contact,
  type ContactList,
  type ChatInitSettings,
} from '@finos/fdc3';
import { LinkActionHandler, RequestError } from '../../types';

export const teamsLink: LinkActionHandler = async (request) => {
  const { context } = request;
  if (
    context.type !== ContextTypes.Contact &&
    context.type !== ContextTypes.ContactList &&
    context.type !== ContextTypes.ChatInitSettings
  ) {
    throw new RequestError('context type not supported');
  }

  let url;
  if (context.type === ContextTypes.Contact) {
    const url = `https://teams.microsoft.com/l/chat/0/0?users=${(context as Contact).id.email}`;
    return { url };
  } else if (context.type === ContextTypes.ContactList) {
    const emails = (context as ContactList).contacts
      .map((c) => c.id?.email)
      .join(',');
    url = `https://teams.microsoft.com/l/chat/0/0?users=${emails}`;
  } else {
    url = getInitSettingsUrl(context);
  }
  return { url };
};

const getInitSettingsUrl = (context: Context) => {
  const settings = context as ChatInitSettings;
  let emails = '';
  if (settings.members) {
    emails = settings.members.contacts.map((c) => c.id?.email).join(',');
  }
  const message = settings.message;
  let body = '';
  if (message?.text['text/html']) {
    body = encodeURIComponent(message.text['text/html']);
  } else if (message?.text['text/plain']) {
    body = message.text['text/plain'];
  }
  console.log('handleInitSettings!', body);
  return `https://teams.microsoft.com/l/chat/0/0?users=${emails}&message=${body}`;
};
