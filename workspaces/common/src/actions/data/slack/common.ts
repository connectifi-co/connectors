import { Context } from '@finos/fdc3';

export const contextToChannelName = (context: Context): string => {
  return context.type.replace(".", "-");
};