import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class ClodNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CLōD',
		name: 'clod',
		icon: 'file:clod-logo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["model"]}}',
		description: 'Interact with CLōD API (OpenAI-compatible)',
		defaults: {
			name: 'CLōD',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'clodApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. Llama 3.1 8B',
				description: 'The model to use for chat completion',
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'json',
				default: '[{"role": "user", "content": "Hello!"}]',
				required: true,
				description: 'Array of message objects with role and content',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberStepSize: 0.1,
						},
						default: 1,
						description: 'Sampling temperature between 0 and 2',
					},
					{
						displayName: 'Max Tokens',
						name: 'maxTokens',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1024,
						description: 'Maximum number of tokens to generate',
					},
					{
						displayName: 'Stream',
						name: 'stream',
						type: 'boolean',
						default: false,
						description: 'Whether to stream the response (note: streaming not fully handled)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const model = this.getNodeParameter('model', i) as string;
				const messagesRaw = this.getNodeParameter('messages', i) as string | object[];
				const options = this.getNodeParameter('options', i) as {
					temperature?: number;
					maxTokens?: number;
					stream?: boolean;
				};

				// Parse messages if string
				let messages: object[];
				if (typeof messagesRaw === 'string') {
					try {
						messages = JSON.parse(messagesRaw);
					} catch {
						throw new NodeOperationError(
							this.getNode(),
							'Messages must be valid JSON array',
							{ itemIndex: i },
						);
					}
				} else {
					messages = messagesRaw;
				}

				// Validate messages is an array
				if (!Array.isArray(messages)) {
					throw new NodeOperationError(
						this.getNode(),
						'Messages must be an array',
						{ itemIndex: i },
					);
				}

				// Build request body
				const body: Record<string, unknown> = {
					model,
					messages,
				};

				if (options.temperature !== undefined) {
					body.temperature = options.temperature;
				}
				if (options.maxTokens !== undefined) {
					body.max_tokens = options.maxTokens;
				}
				if (options.stream !== undefined) {
					body.stream = options.stream;
				}

				const requestOptions: IHttpRequestOptions = {
					method: 'POST',
					url: 'https://api.clod.io/v1/chat/completions',
					body,
					json: true,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'clodApi',
					requestOptions,
				);

				returnData.push({
					json: response,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
