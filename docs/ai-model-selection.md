# AI Model Selection for Waste Guidance

## Project requirements

The waste guidance feature should use the Groq API with a stable, high-quality language model that can produce clear disposal advice, recycling instructions, safety notes, and eco-friendly suggestions. The selected configuration for this project is:

- Model: `llama-3.3-70b-versatile`
- Temperature: `0.3`
- Max tokens: `800`

## Comparison of Groq models considered

The repository currently configures one production Groq model for the waste assistant. The selection was made between the chosen model and smaller, faster alternatives that are often used for lightweight tasks.

| Model | Suitability for this project | Notes |
| --- | --- | --- |
| `llama-3.3-70b-versatile` | Best fit | Balanced for detailed, structured guidance with strong reasoning quality and enough output length. |
| Smaller Groq chat models | Less suitable | Faster and cheaper, but less reliable for nuanced waste-management responses that require detailed instructions. |

## Why `llama-3.3-70b-versatile` was selected

`llama-3.3-70b-versatile` was selected because it provides a strong balance of reasoning quality, stability, and response depth for a sustainability assistant. The use case requires the model to explain disposal steps clearly, mention safety considerations, and provide practical recommendations without becoming overly verbose.

## Configuration values

The project now uses the following values in the Groq request:

- `model = "llama-3.3-70b-versatile"`
- `temperature = 0.3`
- `max_tokens = 800`

These settings help keep the assistant accurate and consistent while allowing enough room for a complete response.

## Expected JSON response format

The backend currently returns the generated guide payload in a JSON response shaped like this:

```json
{
  "success": true,
  "item": "plastic bottle",
  "guide": "Detailed waste guidance text"
}
```

## Final conclusion

The selected Groq model and configuration align with the project requirements for a reliable waste-assistance experience. `llama-3.3-70b-versatile` with `temperature = 0.3` and `max_tokens = 800` is the appropriate choice for this feature.
