# <img src="https://www.cursor.com/assets/videos/logo/placeholder-logo.webp" width="30" height="30" /> Cursor Guide

Cursor is a powerful AI-integrated code editor built on VSCode, designed to make developers more productive through advanced AI assistance.

## 📥 Installation

1. Download Cursor from the [official website](https://cursor.sh)
2. Follow the installation instructions for your operating system:
   - **macOS**: Open the downloaded DMG file and drag Cursor to your Applications folder
   - **Windows**: Run the installer and follow the on-screen instructions
   - **Linux**: Extract the downloaded package and run the Cursor executable
3. Launch Cursor and complete the initial setup

## 🧠 Getting Started with Cursor

### First Steps

1. Open Cursor and sign in with your account
2. Explore the familiar VSCode-based interface
3. Access the AI features via the sidebar or keyboard shortcuts
4. Open a project or create a new one to get started

### Claude Integration

Cursor features seamless integration with advanced AI models like Claude that appear in chat panels. With Cursor's AI, you can:

- Chat about your code
- Get coding assistance
- Generate entire projects
- Debug complex problems
- Run code analysis

## 🎮 Core Features

### AI Assistant

Access the Cursor AI assistant by pressing `Ctrl+K` (or `Cmd+K` on Mac) to:

- Generate code based on natural language descriptions
- Refactor existing code
- Debug problems
- Get code explanations
- Optimize performance

### Smart Code Completion

Cursor's AI provides context-aware code completion that goes beyond traditional autocompletion:

- Complete entire functions based on comments or function signatures
- Suggest appropriate patterns based on your codebase
- Automatically import required dependencies

### Conversational AI Interface

- Hold conversations with the AI about your code
- Reference specific parts of your codebase with @-mentions
- Ask follow-up questions with context retained

## 🛠️ Understanding Cursor Rules

Cursor provides a powerful system for customizing AI behavior through rules. These rules help create a more personalized coding experience that understands your preferences and project requirements.

### The Three Layers of Cursor Rules

Cursor implements a three-layer approach to rules that allows for comprehensive customization of AI behavior across different contexts.

#### 1. Global Rules (Settings)

Global rules apply across all workspaces and projects, establishing core principles that the AI will follow regardless of which project you're working on.

**Location**: Stored in Cursor Settings
**Access Path**: Settings > General > Rules for AI
**Format**: Plain text or markdown

**Purpose**:

- Set the AI's overall personality and problem-solving approach
- Define general coding standards you prefer across all projects
- Establish core principles for all AI interactions
- Set default behaviors regardless of project

**Example of Global Rules**:

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

This template forces the AI to skip unnecessary pleasantries and focus on delivering concrete solutions, code samples, and expert-level explanations.

#### 2. Project-Specific Rules (.cursorrules)

A file in your project root that customizes the AI's behavior for your specific project.

**Location**: At the root of your project directory
**Filename**: `.cursorrules` (legacy approach - now deprecated as of v0.45+)
**Format**: Markdown

**Purpose**:

- Define project-specific coding standards
- Explain the architectural patterns of your project
- Set quality control requirements
- Reference project documentation and patterns

**Example for a React project**:

```markdown
# React Project Standards

## Component Architecture

- Use functional components with hooks
- Follow atomic design principles
- Keep components small and focused
- Co-locate related files (component, test, styles)

## State Management

- Use React Context for global state
- Prefer local state when possible
- Use Redux only for complex state requirements
- Follow immutability patterns

## Styling Approach

- Use CSS modules for component styling
- Follow BEM naming convention
- Maintain a consistent color scheme
```

#### 3. Rule Files (.cursor/rules/\*.mdc)

The modern approach to Cursor rules introduces a third layer with directory-based rule files. This approach allows for more granular control over AI behavior.

**Location**: In the `.cursor/rules/` directory within your project
**Filename**: Various `.mdc` files (e.g., `instructions.mdc`, `typescript.mdc`)
**Format**: Markdown with special directives

**Purpose**:

- Organize rules by file type, language, or project area
- Create language-specific or framework-specific guidelines
- Apply rules to specific file patterns using globs
- Provide more contextual AI assistance

**Example Structure**:

```
.cursor/
  rules/
    instructions.mdc   # Main project rules
    typescript.mdc     # TypeScript-specific rules
    react.mdc          # React-specific rules
    api.mdc            # API-related rules
```

**Example of an .mdc file**:

```markdown
---
description: TypeScript rules for the project
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript Coding Standards

## Types and Interfaces

- Prefer interfaces over types for object definitions
- Use explicit return types for functions
- Avoid 'any' type - use unknown instead when necessary

## Error Handling

- Use typed error handling with custom error classes
- Avoid throwing strings or generic errors
```

The `.mdc` files within the `.cursor/rules/` directory are the first context loaded by Cursor's AI when interacting with your code, ensuring that AI assistance is tailored to your project's specific needs and conventions.

### Special Features of .mdc Rule Files

#### File References with @

You can reference specific files in your rules to provide additional context:

```markdown
# Project Architecture

Our authentication flow is implemented in @src/auth/AuthService.ts
```

#### Rich Markdown Support

Rule files support full markdown including:

- Code blocks with syntax highlighting
- Lists and tables
- Headers for organization
- Links to documentation

### Best Practices for Cursor Rules

#### 1. Keep Rules Concise and Specific

```markdown
# Bad (too vague)

- Write good code
- Follow best practices

# Good (specific and actionable)

- Use async/await instead of Promises with .then()
- Include type annotations for function parameters
- Handle errors with try/catch blocks
```

#### 2. Use Formatting for Clarity

Use bullet points, numbered lists, and markdown formatting to make your rules easier for the AI to follow:

```markdown
# Coding Standards

1. **Naming Conventions**

   - Use camelCase for variables and functions
   - Use PascalCase for classes and components
   - Use UPPERCASE for constants

2. **File Organization**
   - One component per file
   - Group related files in feature folders
   - Keep index files for exports only
```

#### 3. Prioritize Important Rules

Place the most important rules at the beginning of your rule files, as they'll have the strongest influence on the AI's behavior.

#### 4. Create Rules in Logical Groups

Organize your rules into logical sections based on different aspects of your codebase:

```markdown
## Architecture

- Follow MVC pattern
- Use dependency injection

## Performance

- Minimize DOM manipulations
- Cache expensive calculations

## Security

- Sanitize user inputs
- Use HTTPS for all API calls
```

## 🚀 Best Practices

### Effective AI Collaboration

- Be specific in your requests to the AI
- Provide context when asking questions
- Start with clear instructions when generating code
- Iterate on AI-generated code to refine it

## 🔄 Updates

Stay up-to-date with the latest features:

1. Open the Help menu
2. Select "Check for Updates"
3. Follow the prompts to install any available updates

## 🆘 Help & Support

- Visit the [Cursor Documentation](https://docs.cursor.com)
