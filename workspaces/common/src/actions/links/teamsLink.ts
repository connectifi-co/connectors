import type { Context, Contact, ContactList } from '@finos/fdc3';
import { createResponse } from '../../utils';
import { ActionHandler, HTTPResponse } from '../../types';

interface ChatInitSettings {
  type: 'fdc3.chat.intiSettings';
  message: Message;
  members: ContactList;
}

interface Message {
  text: { [key: string]: string };
}

const getEmailList = (contactList: ContactList): string => {
  if (contactList) {
    const emailArray = contactList.contacts.map((contact) => {
      return contact.id?.email;
    });
    return emailArray.join(',');
  }
  return '';
};

const handleInitSettings = (context: Context): HTTPResponse => {
  const settings = context as ChatInitSettings;
  let emails = '';
  if (settings.members) {
    emails = getEmailList(settings.members);
  }
  const message = settings.message;
  let body = '';
  if (message?.text['text/html']) {
    body = encodeURIComponent(message.text['text/html']);
  } else if (message?.text['text/plain']) {
    body = message.text['text/plain'];
  }
  console.log('handleInitSettings!', body);
  const url = `https://teams.microsoft.com/l/chat/0/0?users=${emails}&message=${body}`;
  return createResponse(200, { url });
};

const handleContactList = (context: ContactList): HTTPResponse => {
  const emails = getEmailList(context);
  const url = `https://teams.microsoft.com/l/chat/0/0?users=${emails}`;
  return createResponse(200, { url });
};

export const teamsLink: ActionHandler = async (params) => {
  const { context } = { ...params };
  if (context.type === 'fdc3.contact') {
    const url = `https://teams.microsoft.com/l/chat/0/0?users=${(context as Contact).id.email}`;
    return createResponse(200, { url });
  }
  if (context.type === 'fdc3.chat.initSettings') {
    return handleInitSettings(context);
  }
  if (context.type === 'fdc3.contactList') {
    const contactList = context as ContactList;
    return handleContactList(contactList);
  }

  return createResponse(400, {
    message: 'unhandled intent and/or context type',
  });
};
