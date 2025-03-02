import { ChatCompletion } from 'openai/resources';

/**
 * Required to ensure JSON.stringify'd and zod.parse'd objects can be compared by property value,
 * out of order.
 */
const ObjectPropertySorter = (a: any, b: any) => {
  return a.type.localeCompare(b.type);
};

/**
 * Validates the sorted content by comparing it with a sorted mock response.
 * @param chatCompletion - The chat completion object containing the message content to be validated.
 * @param mockChatResponseContent - The mock chat response content as a JSON string for comparison.
 */
export const validateChatCompletion = (
  chatCompletion: ChatCompletion,
  mockChatResponseContent: string,
  schema: Zod.ZodObject<any> | Zod.ZodArray<any>,
): void => {
  if (chatCompletion.choices[0].message.content !== null) {
    const parsedContent = JSON.parse(chatCompletion.choices[0].message.content);
    // Sort the parsed content array by properties
    parsedContent.contexts.sort(ObjectPropertySorter);

    // Sort the mockChatResponseContent array by properties for comparison
    const sortedMockContent = JSON.parse(mockChatResponseContent);
    sortedMockContent.contexts.sort(ObjectPropertySorter);

    const validatedContent = schema.parse(parsedContent);

    // Compare the sorted arrays
    expect(validatedContent).toEqual(sortedMockContent);
  }
};
