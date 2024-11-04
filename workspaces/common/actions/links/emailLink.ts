import { createResponse } from '../../lib/utils';
import { ActionHandler } from '../../lib/types';
import { Contact, ContactList } from '@finos/fdc3';

const getEmailList = (contactList: ContactList): string => {
  if (contactList){
    const emailArray = contactList.contacts.map((contact) => {
      return contact.id?.email;
    });
    return emailArray.join(',');
  }
  return '';
};

export const emailLink: ActionHandler = async (params) => {
  const { context } = {...params};
  if (context.type === "cfi.link") {
    const linkHTML = context.url.replace("&","%26").replace(" ","+");
    const subject = `${context.appId} for ${context.subject.replace("&","%26")} on Connectifi!`;
    const body = `${context.text.replace("&","%26")} - <${linkHTML}>`;
    const url = `mailto:?subject=${subject}&body=${body}`;

    return createResponse(200, {url});
  } 
  if (context.type === 'fdc3.contact') {
    const contact = context as Contact;
    const url = `mailto:${contact.id.email}`;
    return createResponse(200, {url});
  }
  if (context.type === 'fdc3.contactList') {
    const emails = getEmailList(context as ContactList);
    const url = `mailto:${emails}`;
    return createResponse(200, {url});
  }

  return createResponse(400, {
    message: 'bad context type',
  });
}