import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { KendraClient, QueryCommand } from '@aws-sdk/client-kendra';

const kendraClient = new KendraClient({ region: process.env.REGION });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const query = event.body ? JSON.parse(event.body).query : '';

    const command = new QueryCommand({
      IndexId: `${process.env.SERVICE_NAME}-${process.env.STAGE}-index`,
      QueryText: query,
    });

    // Query Amazon Kendra for relevant documents
    const kendraResponse = await kendraClient.send(command);
    const relevantDocuments = kendraResponse.ResultItems?.map((item) => item.DocumentId);

    // // Generate response using OpenAI GPT-3
    // const openaiRequest: CreateCompletionRequest = {
    //   model: 'text-davinci-003', // or any other GPT-3 model you prefer
    //   prompt: `${query}\n\nRelevant Documents:\n${relevantDocuments?.join('\n') || 'No relevant documents found.'}`,
    //   max_tokens: 1024,
    //   n: 1,
    //   stop: null,
    //   temperature: 0.7,
    // };

    // const openaiResponse = await openaiClient.createCompletion(openaiRequest);
    // const generatedResponse = openaiResponse.data.choices[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ response: relevantDocuments.length }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while processing your request.' }),
    };
  }
};