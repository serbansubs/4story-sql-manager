# Contributing to 4Story SQL Manager

First off, thank you for considering contributing to 4Story SQL Manager! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Mention your OS version and SQL Server version**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **Include mockups or examples if possible**

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style
- Write clear commit messages
- Update documentation if needed
- Test your changes
- Keep PRs focused on a single feature/fix

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/4story-sql-manager.git
cd 4story-sql-manager

# Install dependencies
npm install

# Run in development mode
npm start

# Build the application
npm run build

# Create portable executable
npm run dist
```

## Code Style

- Use 2 spaces for indentation
- Use meaningful variable and function names
- Add comments for complex logic
- Follow React best practices
- Keep components small and focused

## Testing

Before submitting a PR:

1. Test all existing features still work
2. Test your new feature/fix thoroughly
3. Test on different databases if possible
4. Check for console errors

## Project Structure

- `src/` - React components and styles
  - `App.jsx` - Main application component
  - `App.css` - Styling
  - `index.jsx` - React entry point
  - `index.html` - HTML template
- `main.js` - Electron main process and IPC handlers
- `webpack.config.js` - Build configuration
- `package.json` - Dependencies and scripts

## Questions?

Feel free to open an issue with your question!

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to learn and improve the project together.

---

Thank you for contributing! 🚀
