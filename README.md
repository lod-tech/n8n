# n8n-nodes-clod

This is an n8n community node for the [CLōD](https://clod.io) API, an OpenAI-compatible LLM service.

## Installation

In your n8n instance, go to **Settings > Community Nodes** and install:

```
@clod_io/n8n-nodes-clod
```

Or install via npm:

```bash
npm install @clod_io/n8n-nodes-clod
```

## Credentials

1. Go to [https://app.clod.io](https://app.clod.io) and sign in
2. Navigate to your account settings to get your API key
3. In n8n, create new credentials of type **CLōD API** and enter your API key

## Usage

The CLōD node supports chat completions with the following parameters:

- **Model** (required): The model name to use (e.g., "Llama 3.1 8B")
- **Messages** (required): JSON array of message objects with `role` and `content`
- **Options**:
  - Temperature (0-2)
  - Max Tokens
  - Stream

### Example Messages Format

```json
[
  { "role": "system", "content": "You are a helpful assistant." },
  { "role": "user", "content": "Hello!" }
]
```

## License

MIT
