---
title: "LLM Usage"
description: Learn about the LLM-friendly features available in Coral documentation powered by Fumadocs.
---

# LLM Usage with Coral Documentation

Coral documentation is built with [Fumadocs](https://fumadocs.dev), which provides built-in support for making documentation accessible to Large Language Models (LLMs) and AI assistants. This guide covers the LLM features available in the Coral docs.

## Overview

The Coral documentation site includes several LLM-friendly endpoints and features:

1. **Individual Page Markdown** - Get any page as clean markdown via `*.mdx` extension
2. **Complete Documentation Archive** - Download all docs as a single text file
3. **Page Actions** - Copy markdown links and view options on every page
4. **Accept Header Support** - Automatic markdown serving for AI agents

## Individual Page Markdown

Access any documentation page as markdown by appending `.mdx` to the URL:

```
https://coral.design/guides/variants.mdx
https://coral.design/packages/core.mdx
https://coral.docs/guides/llm-usage.mdx
```

### How It Works

The `.mdx` endpoint returns the page content as processed markdown, optimized for LLM consumption:

- Clean markdown format (no HTML, no navigation)
- Processed content (code blocks, examples included)
- Consistent formatting
- Page title and URL included

### Example Usage

```typescript
// Fetch a specific page for LLM context
const response = await fetch('https://coral.design/guides/variants.mdx');
const markdown = await response.text();

// Use in your AI prompt
const prompt = `
Use this Coral documentation to answer questions:
${markdown}

Question: How do I create a button with variants?
`;
```

### Response Format

The response includes:
- Page title
- Page URL
- Full processed markdown content

Example response:
```markdown
# Component Variants (/guides/variants)

Coral supports flexible component variants...

[Full markdown content]
```

## Complete Documentation Archive

Download all documentation pages as a single text file:

```
https://coral.design/llms-full.txt
```

### Use Cases

This endpoint is useful for:
- **AI Training** - Feed entire documentation into AI models
- **Vector Databases** - Index all documentation for semantic search
- **Documentation Analysis** - Process all docs programmatically
- **AI Assistants** - Provide comprehensive context to AI tools

### Response Format

The file contains all documentation pages concatenated together, separated by double newlines:

```markdown
# What is Coral UI? (/)

Coral is a specification format...

---

# Getting Started (/guides/getting-started)

Learn how to use Coral Libraries...

---

# Component Variants (/guides/variants)

Create flexible, multi-variant components...

[All pages continue...]
```

### Example Usage

```typescript
// Fetch all documentation
const response = await fetch('https://coral.design/llms-full.txt');
const allDocs = await response.text();

// Use with AI API
const result = await ai.chat({
  messages: [{
    role: 'system',
    content: `You are a Coral documentation assistant. Here is the full documentation:\n\n${allDocs}`
  }]
});
```

## Accept Header Support

AI agents can automatically receive markdown content by setting the `Accept` header:

```http
GET /guides/variants HTTP/1.1
Accept: text/markdown
```

The proxy middleware automatically rewrites the request to serve markdown content when `text/markdown` is preferred.

### Implementation

The Coral docs use Fumadocs' `isMarkdownPreferred` utility to detect when markdown is requested:

```typescript
// Automatically serves markdown for AI agents
if (isMarkdownPreferred(request)) {
  // Rewrites to .mdx endpoint
}
```

## Page Actions

Every documentation page includes action buttons in the header:

### LLM Copy Button

The **Copy Markdown** button provides a direct link to the markdown version of the current page. Click it to copy the `.mdx` URL to your clipboard.

### View Options

The **View Options** menu provides:
- **Markdown URL** - Direct link to `.mdx` version
- **GitHub Link** - View source on GitHub

These actions make it easy to share documentation pages with AI assistants or copy markdown links for programmatic access.

## Technical Details

### Implementation

The LLM features are implemented using Fumadocs' built-in LLM support:

1. **`getLLMText` Function** - Converts pages to markdown format
2. **Route Handlers** - Serve markdown content at specific endpoints
3. **Proxy Middleware** - Handles Accept header detection
4. **Page Actions** - UI components for accessing markdown versions

### Source Configuration

The documentation uses Fumadocs MDX with processed markdown enabled:

```typescript
export const docs = defineDocs({
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});
```

This enables the `getText('processed')` method that returns clean markdown content.

## Best Practices

### For AI Integration

1. **Use Specific Pages** - Fetch individual pages when you need specific information
2. **Use Full Archive** - Use `llms-full.txt` for comprehensive context or training
3. **Cache Responses** - These endpoints are cached forever (`revalidate = false`)
4. **Respect Rate Limits** - Don't abuse the endpoints with excessive requests

### For Documentation Authors

1. **Write Clear Content** - LLMs work better with well-structured, clear documentation
2. **Use Code Examples** - Include working examples that LLMs can reference
3. **Keep It Updated** - Ensure documentation stays current with code changes
4. **Test with AI** - Try asking AI assistants questions about your docs

## API Reference

### Endpoints

| Endpoint | Description | Content-Type |
|----------|-------------|--------------|
| `/{path}.mdx` | Individual page markdown | `text/markdown` |
| `/llms-full.txt` | All pages as text | `text/plain` |
| `/{path}` (with `Accept: text/markdown`) | Auto-served markdown | `text/markdown` |

### Example Requests

```bash
# Get specific page
curl https://coral.design/guides/variants.mdx

# Get all documentation
curl https://coral.design/llms-full.txt

# Request markdown via Accept header
curl -H "Accept: text/markdown" https://coral.design/guides/variants
```

## Resources

- [Fumadocs LLM Integration Docs](https://www.fumadocs.dev/docs/integrations/llms) - Complete Fumadocs LLM documentation
- [Fumadocs Documentation](https://fumadocs.dev) - Learn more about Fumadocs features
- [Coral Documentation](/guides/getting-started) - Start learning Coral

## Example: Using with AI Assistants

Here's a complete example of using Coral documentation with an AI assistant:

```typescript
// Fetch Coral documentation
async function getCoralDocs() {
  const response = await fetch('https://coral.design/llms-full.txt');
  return await response.text();
}

// Use with AI API
async function askCoralAI(question: string) {
  const docs = await getCoralDocs();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a Coral UI documentation assistant. Here is the complete documentation:\n\n${docs}`
        },
        {
          role: 'user',
          content: question
        }
      ]
    })
  });

  return response.json();
}

// Example usage
const answer = await askCoralAI('How do I create a button component with variants?');
```

This setup allows AI assistants to have comprehensive knowledge of Coral documentation and provide accurate, context-aware answers.
