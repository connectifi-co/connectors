import { createResponse } from '../../lib/utils';
import { ActionHandler } from '../../lib/types';

export const emailLink: ActionHandler = async (params) => {
  const { context } = {...params};
  if (context.type === "cfi.link") {
    const linkHTML = context.url.replace("&","%26").replace(" ","+");
    const subject = `${context.appId} for ${context.subject.replace("&","%26")} on Connectifi!`;
    const body = `${context.text.replace("&","%26")} - <${linkHTML}>`;
    const url = `mailto:?subject=${subject}&body=${body}`;

    return createResponse(200, {url});
  } 

  return createResponse(400, {
    message: 'bad context type',
  });
}