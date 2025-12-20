# Smart Search Feature Documentation

## Overview

The Smart Search feature is a powerful, real-time search system that allows you to quickly find tables, functions, and data across your entire SQL Server database. It combines instant search with intelligent fuzzy matching to help you find what you're looking for, even with typos.

## How to Access

1. Connect to a SQL Server database
2. Select a database from the left panel
3. Click the **"Smart Search"** button in the toolbar (primary blue button with 🔍 icon)
4. The search dialog will open

## Search Capabilities

### 1. Table Name Search 📊

Searches across all tables in the selected database:
- **Table names**: Matches partial table names (e.g., "user" finds "Users", "UserAccounts", "tbl_user_data")
- **Schema names**: Searches schema names (e.g., "dbo")
- **Case insensitive**: "USERS", "users", "Users" all work the same

**Results Display**:
- Shows up to 10 matching tables
- Format: `schema.tablename`
- Click to instantly open the table in a new tab

### 2. Function & Procedure Search ⚙️

Searches across all functions and stored procedures:
- **Function names**: Partial matching on function/procedure names
- **Schema names**: Also searches schema information
- **Case insensitive**: Flexible search

**Results Display**:
- Shows up to 10 matching functions/procedures
- Displays function type (FUNCTION or PROCEDURE)
- Format: `schema.functionname`
- Click to instantly open the function editor

### 3. Data Search 🔎 (NEW!)

Searches **within table rows** across all text columns:
- Searches the first 20 tables in your database (for performance)
- Only searches text-based columns (varchar, nvarchar, char, text)
- Finds up to 100 matching rows per table
- Limits to top 5 tables with matches

**Results Display**:
- Shows table name with total match count
- Displays top 3 matching rows per table
- Shows the column name and value that matched
- Value preview (first 50 characters)
- Example:
  ```
  dbo.Users
  Found 5 matching rows
    UserName: JohnDoe
    Email: john.doe@example.com
    FirstName: John
  ```
- Click to open the table (you can then use the inline search to filter)

### 4. Smart Suggestions 💡

When no exact matches are found, the system suggests similar items:
- **Fuzzy matching**: Finds items that are similar to your search term
- **Similarity score**: Shows match percentage (e.g., "85% match")
- **Top 5 suggestions**: Shows the closest matches
- **Mixed results**: Can suggest both tables and functions

**How it works**:
- Exact match: 100%
- Contains your search term: 80%
- Your search term is contained: 70%
- Common characters: Based on overlap

**Example**:
- Search: "usrs"
- Suggestion: "Users" (75% match)

## How to Use

### Basic Search

1. Open Smart Search dialog
2. Start typing in the search box
3. Results appear instantly as you type
4. Click any result to open it

### Search Tips

- **Be specific**: More characters = better results
- **Partial matching works**: "usr" finds "Users", "UserSettings", etc.
- **Check all sections**: Results are grouped by type (Tables, Functions, Data, Suggestions)
- **Data search is powerful**: Can find specific values like email addresses, usernames, IDs

### Examples

**Example 1: Find a table**
```
Search: "account"
Results:
📊 Tables (3)
  - dbo.Accounts
  - dbo.UserAccounts
  - dbo.AccountSettings
```

**Example 2: Find data containing email**
```
Search: "admin@"
Results:
🔎 Data Matches (2 rows)
  dbo.Users
  Found 2 matching rows
    Email: admin@example.com
```

**Example 3: Typo correction**
```
Search: "procdure"
Results:
💡 Did you mean...?
  - GetUserProcedure (procedure · 70% match)
  - UpdateProcedure (procedure · 65% match)
```

## Performance

### Optimizations
- **Real-time search**: Results appear as you type (no button press needed)
- **Limited scope**: Data search checks first 20 tables only
- **Row limits**: Maximum 100 rows per table searched
- **Column filtering**: Only searches text columns (skips numeric, date, binary)
- **Efficient queries**: Uses SQL Server's built-in search capabilities

### When to Use Data Search
- Finding specific values (emails, usernames, IDs)
- Locating data when you don't know which table it's in
- Quick data lookup without opening every table

### Performance Notes
- Large databases (100+ tables): Data search may take 2-5 seconds
- Small databases (<20 tables): Nearly instant
- Progress: Search happens in background, UI remains responsive

## UI Features

### Visual Design
- **Color-coded sections**:
  - Tables: Blue
  - Functions: Blue
  - Data matches: Light blue
  - Suggestions: Yellow/Orange
- **Hover effects**: Results highlight on mouse over
- **Clean layout**: Grouped by type with icons
- **Scrollable**: Dialog scrolls if many results

### Keyboard Shortcuts
- **Enter**: Execute search (though auto-search makes this optional)
- **Escape**: Close dialog
- **Click anywhere outside**: Close dialog

### Dialog Behavior
- **Auto-reset**: Clears when you close and reopen
- **Fresh start**: Each search session starts clean
- **No persistence**: Doesn't remember previous searches

## Technical Details

### Backend Implementation
**File**: `main.js` (lines 347-404)

The `search-table-data` IPC handler:
1. Gets all columns for the table from `INFORMATION_SCHEMA.COLUMNS`
2. Filters to text-based columns only
3. Builds dynamic WHERE clause with OR conditions
4. Executes SQL query with TOP 100 limit
5. Formats results with column/value pairs

### Frontend Implementation
**File**: `App.jsx` (lines 806-872, 1497-1769)

The `performSmartSearch` function:
1. Searches tables array (client-side filter)
2. Searches functions array (client-side filter)
3. Loops through first 20 tables calling backend
4. If no results, calculates similarity scores
5. Updates state with all results

### SQL Queries Used

**Column detection**:
```sql
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'schema' AND TABLE_NAME = 'table'
```

**Data search**:
```sql
SELECT TOP 100 *
FROM [schema].[table]
WHERE [column1] LIKE '%searchterm%' OR [column2] LIKE '%searchterm%' ...
```

## Troubleshooting

### No results found
- Check spelling
- Try shorter search terms
- Look at suggestions
- Try searching individual words

### Data search is slow
- Normal for large databases
- First 20 tables limitation helps
- Close dialog and use table-specific search instead

### Suggestions don't match
- Fuzzy matching is approximate
- Suggestions are "best guess"
- Try more specific search terms

## Comparison: Smart Search vs Table Search

| Feature | Smart Search | Table Search |
|---------|--------------|--------------|
| **Scope** | Entire database | Single open table |
| **Searches** | Tables, functions, data | Current table rows only |
| **Access** | Toolbar button | Each table tab |
| **Results** | Opens new tabs | Filters current view |
| **Speed** | 2-5 sec (large DB) | Instant |
| **Best for** | Finding data | Filtering known table |

## Best Practices

1. **Start broad, narrow down**: Begin with general terms, refine as needed
2. **Use table search after**: Open table with Smart Search, filter with table search
3. **Check all result sections**: Don't stop at first section
4. **Leverage suggestions**: They often point to what you need
5. **Close when done**: Dialog auto-resets for next search

## Future Enhancements (Ideas)

Potential improvements for future versions:
- Search history
- Save favorite searches
- Export search results
- Search across multiple databases
- Include numeric column search
- Regex support
- Search result sorting options

---

**Feature developed by**: Serban [pnk]
**Version**: 1.0.0
**Last updated**: 2025-01-18
