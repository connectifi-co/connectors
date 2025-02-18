import type { Context, InstrumentList } from '@finos/fdc3';
import { Summary, ServerError } from '../../../types';
import OpenAI from 'openai';
import { OPENAI_MODEL } from '.';
import { summarySchema, instrumentListSchema, similarCompaniesDataReturnPrompt, summaryDataReturnPrompt } from './common';

const mainSystemPrompt: string = `You are an assistant providing objective and accurate information about publicly traded companies.`;

export const getCompanySummary = async ( apiKey: string, context: Context ): Promise<Summary> => {
  const openai = new OpenAI({ apiKey: apiKey });

const summaryDetailsPrompt = `
  You provide company summaries as markdown formatted string in the 'text' field of the JSON output.
  Here is an example output:  
  {
      type: 'connect.summary';
      title: '<Company Name> (<Ticker Name>) - Summary',
      text: 
        <Company Synopsis>
        #### Background
        <Company Background>
        #### Industry & Market Overview
        <Industry & Market Overview>
        #### Financial Performance
        <Financial Performance>
        #### Conclusion & Outlook
        <Conclusions>
      
    }
`;
const summaryPrompt = (context: Context): string => `
    Please provide a summary of the the company ${context.name} with the ticker symbol ${context.id?.ticker}
`;
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  messages.push({ 
    role: 'system', 
    content: `
    ${mainSystemPrompt} 
    ${summaryDetailsPrompt}
    ${summaryDataReturnPrompt}
    ` 
  });
  messages.push({ role: 'user', content: summaryPrompt(context) });

  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: OPENAI_MODEL,
    response_format: {type:"json_schema", json_schema: summarySchema}
  });

  if (chatCompletion?.choices.length > 0) {
    const message = chatCompletion.choices[0].message.content;
    if (message) {
      const summary: Summary = JSON.parse(message);
      if (summary) {
        return summary;
      }
    }
  }

  return {
    type: 'connect.summary',
    title: 'Error',
    text: 'Summary could not be generated',
  };
};

const similarPrompt = (context: Context): string => `
    Please provide a list of companies similar to ${context.name} with the ticker symbol ${context.id?.ticker}.
    Return the list as an FDC3 instrumentList JSON object.
`;
export const getSimilarCompanies = async ( apiKey: string, context: Context ): Promise<InstrumentList> => {
  const openai = new OpenAI({ apiKey: apiKey });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  messages.push({ 
    role: 'system', 
    content: `${mainSystemPrompt} 
    You will identify similar companies by industry, business model, and other characteristics of the companies involved.
    ${similarCompaniesDataReturnPrompt}
    ` 
  });
  messages.push({ role: 'user', content: similarPrompt(context) });

  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: OPENAI_MODEL,
    response_format: {type:"json_schema", json_schema: instrumentListSchema}
  });

  if (chatCompletion?.choices.length > 0) {
    const message = chatCompletion.choices[0].message.content;
    if (message) {
      const list: InstrumentList = JSON.parse(message);
      if (list) {
        return list;
      }
    }
  }

  throw new ServerError('similar companies could not be found');
};
