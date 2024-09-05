import { awsResponse } from './utils';
import type { Context } from '@finos/fdc3';

export const emailLink = async ( context:Context) => {
  if (context.type === "cfi.link") {
    const linkHTML = context.url.replace("&","%26").replace(" ","+");
    const subject = `${context.appId} for ${context.subject.replace("&","%26")} on Connectifi!`;
    const body = `${context.text.replace("&","%26")} - <${linkHTML}>`;
    const url = `mailto:?subject=${subject}&body=${body}`;

    return awsResponse(200, {url});
  } 

  return awsResponse(400, {
    message: 'bad context type',
  });
}