import type { Context, InstrumentList } from '@finos/fdc3';
import { Summary, ServerError } from '../../../types';
import OpenAI from 'openai';
import { OPENAI_MODEL } from '.';
import { summarySchema, instrumentListSchema, similarCompaniesDataReturnPrompt, summaryDataReturnPrompt } from './common';

const mainSystemPrompt: string = `You are an assistant providing information about publicly traded companies with a growth point of view.`;

export const getCompanyGrowthSummary = async ( apiKey: string, context: Context ): Promise<Summary> => {
  const openai = new OpenAI({ apiKey: apiKey });

const summaryDetailsPrompt = `
  You provide company summaries with a growth POV as markdown formatted string in the 'text' field of the JSON output.
  Here is an example output:
  {
      type: 'connect.summary';
      title: '<Company Name> (<Ticker Name>) - Summary',
      text: 
        <Company Synopsis>
        #### Growth Perspective of <Ticker>
        <Growth Perspective>
        #### Potential Growth Challenges
        <List Challenges>
        #### Growth Outlook: <Outlook>
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
    Please provide a list of similar companies from a growth perspective to ${context.name} with the ticker symbol ${context.id?.ticker}.
    Return the list as an FDC3 instrumentList JSON object.
`;
export const getSimilarGrowthCompanies = async ( apiKey: string, context: Context ): Promise<InstrumentList> => {
  const openai = new OpenAI({ apiKey: apiKey });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  messages.push({ 
    role: 'system', 
    content: `${mainSystemPrompt} 
    You will identify similar companies, with a growth focus, by industry, business model, and other characteristics of the companies involved.
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
