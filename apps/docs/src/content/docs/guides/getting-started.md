---
title: Getting Started
description: Learn how to use Coral Libraries in your project.
---

## Installation

Install packages from the Coral Libraries monorepo using your preferred package manager:

```bash
# Install a specific package
pnpm add @repo/core

# Using npm
npm install @repo/core

# Using yarn
yarn add @repo/core
```

## Usage

Import and use functions from the installed packages:

```typescript
import { hello } from "@repo/core";

console.log(hello()); // "Hello, World!"
```

## Development

To work on the monorepo locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build all packages:
   ```bash
   pnpm build
   ```
4. Run in development mode:
   ```bash
   pnpm dev
   ```

## Next Steps

- Learn about [releasing packages](/guides/releasing/)
- Explore available [packages](/packages/)
