# 4Story SQL Manager

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20x64-blue" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/version-1.1.0-orange" alt="Version">
</p>

A lightweight, free, and open-source SQL Server database management tool built with Electron and React. No installation required, no license keys, no BS.

## 🎯 Why This Tool?

Can't find a decent free SQL Server manager? This is a fully-featured alternative built for the community with all the essential features you need for database management.

**Key Advantages:**
- ✅ Completely free and open source (MIT license)
- ✅ No installation - portable executable
- ✅ Smart Search feature (search data inside tables!)
- ✅ Clean, professional UI
- ✅ Safe by default (primary key validation)

## ✨ Features

### 🆕 What's New in v1.1.0
- **📄 Pagination System**: Navigate large tables with 1000 rows per page
- **🖱️ Universal Context Menus**: Right-click anywhere for quick actions
- **⌨️ Keyboard Shortcuts**: Ctrl+F (search), Ctrl+N (new table), Ctrl+Shift+N (new function)
- **➕ Create Table**: Visual designer with interactive column editor
- **➕ Create Function/Procedure**: Full SQL editor for creating routines
- **🗑️ Delete Functions**: Available in all views
- **🔍 Full Table Search**: Searches entire database, not just current page
- **🎨 Optimized UI**: Larger window (1600x1000), better dialogs, cleaner toolbar

**[See full changelog →](CHANGELOG.md)**

### 🔍 Smart Search
- **Real-time search** as you type (press **Ctrl+F** anywhere!)
- Search across **table names, functions, and row data**
- Find data inside tables without opening them
- **"Did you mean...?"** fuzzy matching for typos
- Shows preview of matching data with column names
- One-click to open any result

**[Read full Smart Search documentation →](SMART_SEARCH.md)**

### 🔌 Core Features
- **Context Menus**: Right-click on tables, functions, databases for quick actions
- **Pagination**: Handle large tables with efficient page navigation
- **CRUD Operations**: Create, read, update, delete tables and functions
- Connect to SQL Server with multiple connections
- Browse databases, tables, and functions in tree view
- View and edit table data inline with smart primary key detection
- Professional dark theme code editor for functions/procedures
- Execute functions with parameter input dialog
- Copy tables between databases (with or without data)
- Multiple view modes: Grid, List, Details
- Multi-tab workflow
- Server-side search and filtering

**[See complete feature list →](FEATURES.md)**

## 📥 Download & Installation

### Option 1: Download Release
1. Go to [Releases](../../releases)
2. Download the latest `.zip` file
3. Extract and run `4Story SQL Manager.exe`

No installation required!

### Option 2: Build from Source
See [Development](#-development) section below.

## 🔧 Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build the application
npm run build

# Create portable executable
npm run dist
```

### Project Structure
```
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Styles
│   ├── index.jsx        # React entry point
│   └── index.html       # HTML template
├── main.js              # Electron main process
├── package.json         # Dependencies and scripts
└── webpack.config.js    # Build configuration
```

## 🛠️ Tech Stack

- **Electron** - Desktop application framework
- **React** - UI library
- **Fluent UI** - Microsoft's component library
- **MSSQL** - SQL Server driver
- **Webpack** - Module bundler

## 📝 Usage

### Connecting to a Database
1. Enter your SQL Server connection details in the toolbar
2. Click "Connect"
3. Browse databases in the left panel

### Working with Tables
- **Left-click** on a table to open it in a new tab
- **Right-click** on a table for context menu (copy, paste, rename, delete)
- **Double-click** cells to edit data inline
- Use **Ctrl+N** to create a new table with visual designer
- Use the search box to filter rows across entire table
- Navigate large tables with pagination controls
- Copy tables between databases via right-click menu

### Smart Search
- Press **Ctrl+F** from anywhere or click "Search" button in toolbar
- Type to search instantly across:
  - Table names and schemas
  - Function/procedure names
  - Row data within tables (searches all columns)
- Click any result to open that table/function
- Get "Did you mean...?" suggestions for typos

### Working with Functions
- **Left-click** on a function to open the code editor
- **Right-click** for context menu (rename, delete)
- Use **Ctrl+Shift+N** to create new function/procedure
- Edit SQL code in professional dark theme editor
- Click "Run" to execute or "Save" to save changes

### Keyboard Shortcuts
- **Ctrl+F**: Open Smart Search
- **Ctrl+N**: Create New Table (in tables view)
- **Ctrl+Shift+N**: Create New Function (in functions view)
- **Escape**: Close context menus

## 📖 Documentation

- **[FEATURES.md](FEATURES.md)** - Complete feature list with detailed explanations
- **[SMART_SEARCH.md](SMART_SEARCH.md)** - Full Smart Search feature documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the project

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests, report bugs, and suggest features.

## 📋 Requirements

- Windows x64
- SQL Server (any version with TCP/IP enabled)
- Network access to SQL Server

## 🐛 Bug Reports & Feature Requests

Please use [GitHub Issues](../../issues) to report bugs or request features.

When reporting bugs, include:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your Windows and SQL Server versions

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software.

## 👨‍💻 Author

**Serban [pnk]**

Released initially on RageZone community, now open source for everyone!

## ⚠️ Disclaimer

This tool is designed for database management and development purposes. Always backup your data before performing destructive operations. Use at your own risk.

## 🙏 Acknowledgments

- Built with amazing open-source tools from the community
- Thanks to RageZone community for initial feedback
- Inspired by professional database tools but free and open source

## ⭐ Star History

If you find this useful, consider giving it a star! ⭐

---

Built with ❤️ using Electron, React, and Fluent UI
