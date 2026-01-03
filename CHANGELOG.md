# Changelog

All notable changes to 4Story SQL Manager will be documented in this file.

## [1.1.0] - 2026-01-02

### 🎉 Major Features Added

#### Pagination System
- **Table Pagination**: Added pagination controls for tables with more than 1000 rows
- **Previous/Next Buttons**: Navigate through large datasets easily
- **Page Counter**: Shows current page, total pages, and total row count
- **Smart Loading**: Only loads 1000 rows per page for optimal performance

#### Context Menu System (Right-Click)
- **Universal Context Menus**: Right-click anywhere for quick actions
  - Works in tree view (sidebar)
  - Works in grid view
  - Works in list view
  - Works in details view
- **Tables Context Menu**:
  - Open Table
  - Copy Table
  - Paste Table (when available)
  - Rename Table
  - Delete Table
- **Functions Context Menu**:
  - Open Function
  - Rename Function
  - Delete Function
- **Database Context Menu**:
  - Backup Database
  - Paste Table (when available)

#### Keyboard Shortcuts
- **Ctrl+F**: Open Smart Search from anywhere
- **Ctrl+N**: Create New Table (when in tables view)
- **Ctrl+Shift+N**: Create New Function (when in functions view)
- **Escape**: Close context menus

#### CRUD Operations
- **Create Table**: Visual table designer with interactive column editor
  - Add/remove columns dynamically
  - Configure data types, length, primary key, identity, NOT NULL
  - Schema and table name selection
  - Column-by-column configuration
- **Create Function/Procedure**: Full SQL editor for creating routines
  - Syntax examples provided
  - Supports both functions and procedures
- **Delete Functions**: Delete stored procedures and functions from all views
- **Enhanced Delete**: Delete buttons for both tables and functions in all view modes

### 🔍 Search Improvements
- **Full Table Search**: Search now queries entire table, not just current page
- **Server-Side Search**: Filtering performed at database level for better performance
- **All Columns Search**: Searches across all columns automatically
- **Clear Search Button**: Quickly clear search filters
- **Result Counter**: Shows "Filtered" vs "Total" counts when searching

### 🎨 UI/UX Improvements
- **Larger Window**: Increased from 1400x900 to 1600x1000 pixels for better visibility
- **Optimized Dialogs**: All dialogs properly sized to avoid unnecessary scrollbars
  - Create Table Dialog: 700-900px width, 90vh max height
  - Create Function Dialog: 700-900px width, 90vh max height
  - Smart Search Dialog: 650-850px width, 90vh max height
  - Run Function Dialog: 500-800px width, 90vh max height
  - All other dialogs optimized
- **Better Function Editor**: SQL editor increased from 400px to 500px minimum height
- **Cleaner Toolbar**: Removed redundant buttons, moved to context menus
- **Professional Menus**: Native-looking context menus with icons, separators, and hover effects
- **Optimized Content Areas**: Better use of vertical space with adjusted max heights

### 🔒 Database Filtering
- **System Databases Hidden**: Filters out master, tempdb, model, msdb automatically
- **User Databases Only**: Cleaner interface showing only your custom databases

### 🐛 Bug Fixes
- Fixed table search to work across entire dataset instead of just loaded page
- Fixed pagination to properly track and display total row counts
- Improved copy/paste workflow with better user feedback
- Fixed paste functionality - can now paste to any database via context menu
- Resolved issues with context menu positioning

### 🏗️ Technical Improvements
- Backend pagination with offset/limit support
- Server-side WHERE clause filtering for searches
- Enhanced IPC handlers for CRUD operations (create-table, create-function, delete-function)
- Context menu state management system
- Global keyboard event handling
- Improved data flow for table operations

---

## [1.0.0] - 2025-01-18

### Initial Release 🎉

#### Features
- **Database Connection**: Connect to SQL Server with authentication
- **Database Browsing**: Tree view for databases, tables, and functions
- **Table Management**:
  - View table data with inline editing
  - Add and delete rows
  - Copy tables between databases
  - Rename and delete tables
  - Multiple view modes (Grid, List, Details)
- **Function & Procedure Management**:
  - Professional dark theme code editor
  - Edit and save functions/procedures
  - Execute with parameter input dialog
  - View results in table format
  - Rename functions/procedures
- **Smart Search**:
  - Real-time search as you type
  - Search table names, function names, and row data
  - Fuzzy matching with "Did you mean...?" suggestions
  - Shows matching data with column name and value preview
  - Performance optimized for large databases
- **Table Search**: Inline filtering within open tables
- **Multi-Tab Support**: Open multiple tables/functions simultaneously
- **Tab Navigation**: Arrow buttons for easy tab scrolling
- **Data Safety**: Primary key validation and SQL injection protection
- **Portable**: Single executable, no installation required

#### Technical
- Built with Electron 39.2.7
- React 19.2.3 UI
- Fluent UI components
- MSSQL driver for SQL Server
- Webpack production build
- Windows x64 support

#### UI/UX
- Compact professional UI design
- Dark theme code editor
- Responsive layout
- Multiple view options
- Clean, professional interface

---

**Developer**: Serban [pnk]
