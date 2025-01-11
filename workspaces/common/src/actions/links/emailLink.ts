import { type Contact, type ContactList, ContextTypes } from '@finos/fdc3';
import { LinkActionHandler, RequestError } from '../../types';

export const emailLink: LinkActionHandler = async (request) => {
  const { context } = request;
  if (
    context.type !== ContextTypes.Contact &&
    context.type !== ContextTypes.ContactList
  ) {
    throw new RequestError('context type not supported');
  }

  let url: string;
  if (context.type === ContextTypes.Contact) {
    url = `mailto:${(context as Contact).id.email}`;
  } else if (context.type === ContextTypes.ContactList) {
    url = `mailto:${(context as ContactList).contacts.map((c) => c.id?.email).join(',')}`;
  }
  return { url };
};
