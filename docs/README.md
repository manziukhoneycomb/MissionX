# 🚀 AI-Driven Project Template

## ✨ Overview

Welcome! This repository serves as a template designed to kickstart your projects with a foundation built using AI-driven development practices and rules. The goal is to streamline setup and maintain consistency across different parts of your application.

## 📚 Table of Contents

- [🚀 AI-Driven Project Template](#-ai-driven-project-template)
  - [✨ Overview](#-overview)
  - [📚 Table of Contents](#-table-of-contents)
  - [🤖 AI Development Tools](#-ai-development-tools)
  - [🏗️ Components](#️-components)
    - [API (Nest.js)](#api-nestjs)
    - [Client (React)](#client-react)
    - [Landing](#landing)
  - [💬 Windsurf AI Prompts & Workflow](#-windsurf-ai-prompts--workflow)
  - [💬 Cursor AI Prompts & Workflow](#-cursor-ai-prompts--workflow)
  - [📚 Resources](#-resources)

## 🤖 AI Development Tools

This project leverages AI code assistance tools to enhance development speed and code quality. We primarily use:

- **[Windsurf](https://codeium.com/windsurf)**: An AI-powered code editor with deep integration for features like code generation, refactoring, debugging, and conversational AI based on your codebase context. See the [Windsurf Guide](./editors/windsurf.md) for setup and usage details.
- **[Cursor](https://cursor.sh)**: A VSCode-based AI-integrated code editor with Claude integration for powerful code generation and assistance. See the [Cursor Guide](./editors/cursor.md) for a detailed overview of its three-layer rules system.

## 🏗️ Components

This template includes three core components:

1.  **API** ⚙️: Built with [Nest.js](https://nestjs.com/). See the [API README](./api/README.md) for details.
2.  **Client** ⚛️: Developed using [React](https://react.dev/). See the [Client README](./client/README.md) for details.
3.  **Landing** 🌐: A simple landing page. See the [Landing README](./landing/README.md) for details.

Feel free to adapt and expand upon this structure as your project evolves!

## 💬 Windsurf AI Prompts & Workflow

This section outlines recommended prompts and workflows when using Windsurf within this project structure. Below are general guidelines intended for a `global_rules.md` file, focusing on code style and conventions:

```markdown
# Code Style & Formatting

- Use English for all code and documentation.
- Use TypeScript only.
- Embrace Strict mode fully with appropriate compiler option compilerOptions: "strict": true.
- Use template literals to define URL patterns and others.
- Use satisfies operator for enforcing type constraints.
- Prefer exact type matches with 'as const'.
- Avoid using any and unknown.
- Avoid mutating parameters
- Strings should be safe.
- Use utility types.
- Always declare the type of each variable and function (parameters and return value).
- One export per file.
- Avoid using comments, the code should be self-explanatory.
- Do not use short-hands.
- Use spread and destructuring.
- Put all declarations at the top of the function or class.

# Naming Conventions

- Use PascalCase for classes.
- Use camelCase for variables, functions, and methods.
- Use kebab-case for file and directory names.
- Use UPPERCASE for environment variables.
- Avoid magic numbers / strings and define constants.
- Use descriptive names that reflect purpose, avoid abbreviations in names.
- Avoid combining values and functionality in names.

# Directory Structure

- Organize by layer first, then by feature
- Keep related files together
- Use index files to simplify imports

# Functions & Logic

- Keep functions short and single-purpose.
- Do not use flags as function parameters
- Avoid deeply nested blocks by:
  - Using early returns.
  - Extracting logic into utility functions.
- Use higher-order functions (map, filter, reduce) to simplify logic.
- Use arrow functions for simple cases (<3 instructions), named functions otherwise.
- Use default parameter values instead of null/undefined checks.
- Use RO-RO (Receive Object, Return Object) for passing and returning multiple parameters.

# Data Handling

- Avoid excessive use of primitive types; encapsulate data in composite types.
- Avoid placing validation inside functions—use classes with internal validation instead.
- Prefer immutability for data.
- Use readonly for immutable properties.
- Use as const for literals that never change.
```

**Project-Specific Rules:** Remember that while the above serves as a good baseline for global rules (`global_rules.md`), project-specific conventions and overrides should be defined in a `.windsurfrules` file at the root of each respective project (e.g., `./api/.windsurfrules`, `./client/.windsurfrules`).

**Character Limit:** Please note that both `global_rules.md` and `.windsurfrules` have a character limit of 6000 characters each. Content exceeding this limit will be truncated by Windsurf.

## 💬 Cursor AI Prompts & Workflow

For Cursor, we use a different approach with its three-layer rules system. Below is a template for global AI behavior that can be set in Cursor's Settings > General > Rules for AI:

```markdown
# AI Response Guidelines

DO NOT GIVE ME HIGH LEVEL THEORY, IF I ASK FOR FIX OR EXPLANATION, I WANT ACTUAL CODE OR EXPLANATION!!! I DON'T WANT "Here's how you can blablabla"

- Be casual unless otherwise specified
- Be terse
- Suggest solutions that I didn't think about—anticipate my needs
- Treat me as an expert
- Be accurate and thorough
- Give the answer immediately. Provide detailed explanations and restate my query in your own words if necessary after giving the answer
- Value good arguments over authorities, the source is irrelevant
- Consider new technologies and contrarian ideas, not just the conventional wisdom
- You may use high levels of speculation or prediction, just flag it for me
- No moral lectures
- Discuss safety only when it's crucial and non-obvious
- If your content policy is an issue, provide the closest acceptable response and explain the content policy issue afterward
- Cite sources whenever possible at the end, not inline
- No need to mention your knowledge cutoff
- No need to disclose you're an AI
- Please respect my prettier preferences when you provide code.
- Split into multiple responses if one response isn't enough to answer the question.

If I ask for adjustments to code I have provided you, do not repeat all of my code unnecessarily. Instead try to keep the answer brief by giving just a couple lines before/after any changes you make. Multiple code blocks are ok.
```

**Project-Specific Rules:** For project-specific rules, create a `.cursor/rules` directory in each project folder and add `.mdc` files for different aspects of your project. For example:

1. `instructions.mdc` for general project rules
2. `typescript.mdc` for TypeScript-specific rules

**Character Limit:** While the legacy `.cursorrules` file had constraints, the new `.mdc` files in `.cursor/rules/` provide more flexibility. Still, it's good practice to keep each file focused and concise.

## 📚 Resources

Useful resources for working with AI/promts:

- **Cursor directory**: [Cursor direcotry](https://cursor.directory/)
- **Awesome cursor rules**: [Awesome cursor rules](https://github.com/PatrickJS/awesome-cursorrules/tree/main)
