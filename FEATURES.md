# 4Story SQL Manager - Features List

## Overview
4Story SQL Manager is a lightweight, SQL Server database management tool built with Electron and React.

## Core Features

### 🔌 Connection Management
- Connect to SQL Server databases with server, user, and password authentication
- Multiple simultaneous connections support
- Connection list with easy switching between servers
- Persistent connection display in left sidebar

### 📊 Database Browsing
- Tree view of all databases on connected server
- Expandable database structure showing:
  - Tables with schema information
  - Functions and Stored Procedures
- Clean, compact navigation interface

### 📋 Table Management
- **View Modes**: Switch between Grid, List, and Details views
- **Table Operations**:
  - View table data with inline editing
  - Add new rows to tables
  - Delete rows from tables
  - Edit cell values with double-click
  - Rename tables
  - Delete tables
  - Copy table structure (with or without data) between databases
- **Multi-Tab Support**: Open multiple tables simultaneously
- **Tab Navigation**: Arrow buttons to scroll through tabs when many are open
- **Smart Primary Key Detection**: Automatically detects and uses actual primary keys for safe updates

### ⚙️ Function & Stored Procedure Management
- **Professional Code Editor**:
  - Dark theme (VS Code style)
  - Syntax highlighting-ready monospace font
  - Compact 11px font for maximum code visibility
  - Clean toolbar with function type badge
- **Function Operations**:
  - View and edit function/procedure definitions
  - Save modified functions
  - Execute functions/procedures with parameter input dialog
  - View execution results in table format
  - Rename functions/procedures
- **Run Dialog**: Input parameters and execute with result display

### 🎨 User Interface
- **Compact Design**: 
- **Multiple View Options**:
  - **Grid View**: Card-based layout with icons
  - **List View**: Compact list format
  - **Details View**: Table format with sortable columns
- **Responsive Layout**:
  - Scrollable left panel for long lists
  - Resizable components
  - Clean, professional styling
- **Dark Theme Code Editor**: Professional code editing experience

### 🛡️ Data Safety Features
- **Primary Key Validation**: Prevents updates without valid primary keys
- **Row Verification**: Ensures exactly 1 row is affected by updates
- **SQL Injection Protection**: Parameterized queries throughout
- **Confirmation Dialogs**: Prompts before destructive operations (delete table, delete row)
- **Error Handling**: Clear error messages for failed operations

### 🔍 Smart Search
- **Instant Search**: Real-time search as you type
- **Multi-Source Search**:
  - **Table Names**: Search across all table names and schemas
  - **Function Names**: Search functions and stored procedures
  - **Data Search**: Search within table row data across all text columns
- **Intelligent Results**:
  - Shows matching tables with schema information
  - Shows matching functions with type (FUNCTION/PROCEDURE)
  - Shows data matches with column name, value preview, and row count
  - Displays up to 5 tables with matching data (top 3 matches per table)
- **Smart Suggestions**: "Did you mean...?" fuzzy matching when no exact matches found
- **Performance Optimized**:
  - Searches first 20 tables for data matches
  - Only searches text/varchar/char columns
  - Limits to 100 rows per table
- **One-Click Access**: Click any result to instantly open that table/function
- **Auto-Reset**: Dialog clears when closed and reopened

### 📊 Table Search
- **Inline Filtering**: Search box in each open table tab
- **Cross-Column Search**: Searches across all columns in the table
- **Live Results**: Shows "X of Y rows" counter
- **Persistent Filter**: Filter stays active while editing table data

### 🔄 Advanced Features
- **Copy/Paste Tables**: Copy entire table structure between databases with optional data
- **Identity Column Support**: Proper handling of identity columns during table copy
- **Multi-Tab Workflow**: Work with multiple tables/functions simultaneously
- **Tab Persistence**: Tabs remain open while navigating
- **Quick Navigation**: Click tree items to open in tabs

### ⌨️ Keyboard & Mouse Support
- Double-click cells to edit
- Enter to save, Escape to cancel editing
- Tab navigation with arrow keys
- Quick access toolbar buttons

## Technical Features

### 🏗️ Architecture
- **Frontend**: React with Fluent UI components
- **Backend**: Electron main process with IPC communication
- **Database**: MSSQL driver for SQL Server
- **Build**: Webpack for bundling, electron-builder for packaging
- **Portable**: Single executable file, no installation required

### 📦 Distribution
- Portable .exe file (no installer needed)
- Lightweight bundle (~17MB webpack output)
- Windows x64 support
- No dependencies installation required for end users

### 🎯 Performance
- Production-mode webpack builds
- Optimized bundle size
- Efficient tree rendering
- Fast database queries

## Credits
**Developed by**: Serban [pnk]

Built with ❤️ using Electron, React, and Fluent UI
