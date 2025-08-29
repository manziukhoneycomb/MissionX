# <img src="https://codeium.com/logo/windsurf_teal_logo.svg" width="30" height="30" /> Windsurf Guide

Windsurf is an innovative AI-powered code editor designed to make coding more efficient through seamless AI integration.

## 📥 Installation

1. Download Windsurf from the [official website](https://codeium.com/windsurf)
2. Follow the installation instructions for your operating system:
   - **macOS**: Open the downloaded DMG file and drag Windsurf to your Applications folder (minimum OS version: OS X Yosemite)
   - **Windows**: Run the installer and follow the on-screen instructions
   - **Ubuntu/Linux**: Extract the downloaded package and run the Windsurf executable
3. Launch Windsurf and complete the initial setup

## 🧠 Getting Started with Windsurf

### First Steps

1. Select your setup flow:
   - Start fresh
   - Import from VS Code
   - Import from Cursor
2. Choose your preferred keybindings (VS Code or Vim)
3. Select your editor theme
4. Sign up or log in with your Codeium account
5. Click "Open Windsurf" to get started

### Cascade - AI Assistant

Windsurf features a powerful AI assistant called "Cascade" that appears in a panel on the right side of the editor. With Cascade, you can:

- Chat about your code
- Get coding assistance
- Generate entire projects
- Run code analysis

## 🎮 Core Features

### AI Assistant

Access the Windsurf AI assistant by pressing `Alt+Space` (or `Option+Space` on Mac) to:

- Generate code based on natural language descriptions
- Refactor existing code
- Debug problems
- Get code explanations
- Optimize performance

### Smart Code Completion

Windsurf's AI provides context-aware code completion that goes beyond traditional autocompletion:

- Complete entire functions based on comments or function signatures
- Suggest appropriate patterns based on your codebase
- Automatically import required dependencies

### Conversational AI Interface

- Hold conversations with the AI about your code
- Reference specific parts of your codebase
- Ask follow-up questions with context retained

## 🛠️ Understanding Windsurf Rules and Memories

Windsurf provides a powerful system for customizing AI behavior through rules and memories. These features help create a more personalized coding experience that understands your preferences and project requirements.

### Memories System

Memories in Windsurf allow for sharing and persisting context across conversations, creating a more coherent experience as you work.

#### Automatic Memories

During conversation, Cascade can automatically generate and store memories when it encounters useful context:

- These memories are associated with the workspace where they were created
- Cascade retrieves them when they're relevant to your current task
- Memories from one workspace are not available in another
- Creating and using auto-generated memories does not consume credits

#### Managing Memories

Access the Memories panel by:

1. Clicking on "Windsurf - Settings" in the bottom-right corner
2. Selecting the "Settings" tab
3. Clicking "Manage" next to "Cascade-Generated Memories"

Alternatively:

- Click the three dots in the top-right corner of the Cascade window
- Select "Manage Memories"

#### Creating Manual Memories

You can ask Cascade to create a memory at any time with prompts like:

- "Create a memory of our project structure"
- "Remember that we're using Material UI for components"

### The Two Layers of Windsurf Rules

Windsurf implements a two-layer approach to rules that allows for both global and project-specific customization.

#### 1. Global Rules (global_rules.md)

Global rules apply across all workspaces and projects, establishing core principles that Cascade will follow regardless of which project you're working on.

**Location**: Stored in your user profile settings
**Filename**: `global_rules.md`
**Format**: Markdown

**Purpose**:

- Set Cascade's overall personality and problem-solving approach
- Define general coding standards you prefer across all projects
- Establish core principles for all AI interactions
- Set default behaviors regardless of project

**Example of Global Rules**:

```markdown
# Global Coding Principles

## Code Style

- Use meaningful variable and function names
- Prefer readability over cleverness
- Comment complex logic, not obvious operations
- Keep functions small and focused

## Development Approach

- Write tests for all new features
- Consider edge cases in implementations
- Optimize for maintainability first, performance second

## Documentation

- Document public APIs thoroughly
- Include examples in documentation
- Explain the "why" not just the "what"
```

#### 2. Project-Specific Rules (.windsurfrules)

A file in your project root that customizes Cascade's behavior for your specific project.

**Location**: At the root of your project directory
**Filename**: `.windsurfrules`
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
- Reference our design system (@docs/design-system.md)
```

**Character Limits**:

- `global_rules.md` and `.windsurfrules` are each limited to 6000 characters
- Any content beyond 6000 characters will be truncated
- If your window has multiple workspaces, the `.windsurfrules` from each workspace will be applied
- Total character limit across all rules is 12,000 characters, with priority given to global rules

### Best Practices for Windsurf Rules

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

Use bullet points, numbered lists, and markdown formatting to make your rules easier for Cascade to follow:

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

#### 3. Use XML Tags for Grouping Rules

XML tags can help communicate and group similar rules effectively:

```markdown
<code_style>

- Use 2 spaces for indentation
- Limit line length to 80 characters
- Use semicolons at the end of statements
- Use single quotes for strings
  </code_style>

<architecture>
- Follow container/component pattern
- Use custom hooks for reusable logic
- Keep business logic out of components
</architecture>
```

#### 4. Add to .gitignore (OPTIONAL)

To ensure project-specific rules are only applied to your local project:

- Add `.windsurfrules` to your project's `.gitignore` file

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

Alternatively:

- Click on your Profile icon dropdown > Check for Updates
- Open Command Palette (`Cmd/Ctrl+Shift+P`) > "Check for Updates"
- Click on the "Restart to Update ->" button in the top right if available

## 🆘 Help & Support

- Visit the [Windsurf Documentation](https://docs.codeium.com/windsurf)
