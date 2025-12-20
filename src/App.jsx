import React, { useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Button,
  Input,
  Tree,
  TreeItem,
  TreeItemLayout,
  Card,
  SplitButton,
  MenuItem,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Field,
  Checkbox,
  Tab,
  TabList
} from '@fluentui/react-components';
import {
  Database20Regular,
  Table20Regular,
  Code20Regular,
  Copy20Regular,
  CloudDatabase20Regular,
  Search20Regular,
  Dismiss20Regular,
  Grid20Regular,
  List20Regular,
  DocumentTableArrowRight20Regular,
  Play20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular
} from '@fluentui/react-icons';
import './App.css';

const { ipcRenderer } = window.require('electron');

// Table Tab Content Component
function TableTabContent({ tab, setTabs, tabs }) {
  const [editingCell, setEditingCell] = React.useState(null);
  const [editValue, setEditValue] = React.useState('');
  const [newRow, setNewRow] = React.useState(null);
  const [tableSearchTerm, setTableSearchTerm] = React.useState('');

  const handleCellEdit = (rowIndex, columnName, currentValue) => {
    setEditingCell({ rowIndex, columnName });
    setEditValue(currentValue || '');
  };

  const saveCellEdit = async (rowIndex, columnName) => {
    const row = tab.data[rowIndex];
    // First try to find actual primary key column
    let primaryKeyCol = tab.columns.find(col => col.IS_PRIMARY_KEY === 1);

    // Fallback to column with 'id' in name if no primary key found
    if (!primaryKeyCol) {
      primaryKeyCol = tab.columns.find(col => col.COLUMN_NAME.toLowerCase().includes('id'));
    }

    // Last resort - use first column
    if (!primaryKeyCol) {
      primaryKeyCol = tab.columns[0];
    }

    // Safety check - don't update if we can't identify the row uniquely
    if (!primaryKeyCol || row[primaryKeyCol.COLUMN_NAME] === undefined || row[primaryKeyCol.COLUMN_NAME] === null) {
      alert('Cannot edit: No primary key found or primary key value is null for this row');
      setEditingCell(null);
      return;
    }

    const result = await ipcRenderer.invoke('update-cell', {
      connectionId: tab.connectionId,
      database: tab.database,
      schema: tab.table.TABLE_SCHEMA,
      table: tab.table.TABLE_NAME,
      column: columnName,
      value: editValue,
      primaryKey: primaryKeyCol.COLUMN_NAME,
      primaryKeyValue: row[primaryKeyCol.COLUMN_NAME]
    });

    if (result.success) {
      const updatedTabs = tabs.map(t => {
        if (t.id === tab.id) {
          const newData = [...t.data];
          newData[rowIndex][columnName] = editValue;
          return { ...t, data: newData };
        }
        return t;
      });
      setTabs(updatedTabs);
      setEditingCell(null);
    } else {
      alert('Update failed: ' + result.error);
    }
  };

  const handleAddRow = () => {
    const emptyRow = {};
    tab.columns.forEach(col => {
      emptyRow[col.COLUMN_NAME] = '';
    });
    setNewRow(emptyRow);
  };

  const saveNewRow = async () => {
    const result = await ipcRenderer.invoke('insert-row', {
      connectionId: tab.connectionId,
      database: tab.database,
      schema: tab.table.TABLE_SCHEMA,
      table: tab.table.TABLE_NAME,
      rowData: newRow
    });

    if (result.success) {
      const updatedTabs = tabs.map(t => {
        if (t.id === tab.id) {
          return { ...t, data: [...t.data, newRow] };
        }
        return t;
      });
      setTabs(updatedTabs);
      setNewRow(null);
      alert('Row added successfully!');
    } else {
      alert('Insert failed: ' + result.error);
    }
  };

  const handleDeleteRow = async (rowIndex) => {
    if (!confirm('Are you sure you want to delete this row?')) {
      return;
    }

    const row = tab.data[rowIndex];
    // First try to find actual primary key column
    let primaryKeyCol = tab.columns.find(col => col.IS_PRIMARY_KEY === 1);

    // Fallback to column with 'id' in name if no primary key found
    if (!primaryKeyCol) {
      primaryKeyCol = tab.columns.find(col => col.COLUMN_NAME.toLowerCase().includes('id'));
    }

    // Last resort - use first column
    if (!primaryKeyCol) {
      primaryKeyCol = tab.columns[0];
    }

    // Safety check
    if (!primaryKeyCol || row[primaryKeyCol.COLUMN_NAME] === undefined || row[primaryKeyCol.COLUMN_NAME] === null) {
      alert('Cannot delete: No primary key found or primary key value is null for this row');
      return;
    }

    const result = await ipcRenderer.invoke('delete-row', {
      connectionId: tab.connectionId,
      database: tab.database,
      schema: tab.table.TABLE_SCHEMA,
      table: tab.table.TABLE_NAME,
      primaryKey: primaryKeyCol.COLUMN_NAME,
      primaryKeyValue: row[primaryKeyCol.COLUMN_NAME]
    });

    if (result.success) {
      const updatedTabs = tabs.map(t => {
        if (t.id === tab.id) {
          const newData = t.data.filter((_, idx) => idx !== rowIndex);
          return { ...t, data: newData };
        }
        return t;
      });
      setTabs(updatedTabs);
      alert('Row deleted successfully!');
    } else {
      alert('Delete failed: ' + result.error);
    }
  };

  // Filter rows based on search term
  const filteredData = tab.data.filter(row => {
    if (!tableSearchTerm) return true;
    return tab.columns.some(col => {
      const value = row[col.COLUMN_NAME];
      return value && String(value).toLowerCase().includes(tableSearchTerm.toLowerCase());
    });
  });

  return (
    <Card className="data-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
        <h3 style={{ margin: 0 }}>{tab.title}</h3>
        <Input
          placeholder="Search in table..."
          value={tableSearchTerm}
          onChange={(e) => setTableSearchTerm(e.target.value)}
          contentBefore={<Search20Regular />}
          style={{ flex: '1', maxWidth: '300px' }}
          size="small"
        />
        <Button appearance="primary" onClick={handleAddRow}>
          Add Row
        </Button>
      </div>
      <div style={{ fontSize: '10px', color: '#605e5c', marginBottom: '8px' }}>
        Showing {filteredData.length} of {tab.data.length} rows
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Actions</th>
              {tab.columns.map(col => (
                <th key={col.COLUMN_NAME}>
                  {col.COLUMN_NAME}
                  <div className="column-type">{col.DATA_TYPE}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => {
              const originalIdx = tab.data.indexOf(row);
              return (
              <tr key={originalIdx}>
                <td>
                  <Button
                    size="small"
                    appearance="subtle"
                    onClick={() => handleDeleteRow(originalIdx)}
                    style={{ color: 'red' }}
                  >
                    Delete
                  </Button>
                </td>
                {tab.columns.map(col => (
                  <td
                    key={col.COLUMN_NAME}
                    onDoubleClick={() => handleCellEdit(originalIdx, col.COLUMN_NAME, row[col.COLUMN_NAME])}
                    style={{ cursor: 'cell' }}
                  >
                    {editingCell?.rowIndex === originalIdx && editingCell?.columnName === col.COLUMN_NAME ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveCellEdit(originalIdx, col.COLUMN_NAME)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveCellEdit(originalIdx, col.COLUMN_NAME);
                          if (e.key === 'Escape') setEditingCell(null);
                        }}
                        autoFocus
                        size="small"
                        style={{ width: '100%' }}
                      />
                    ) : (
                      row[col.COLUMN_NAME] !== null ? String(row[col.COLUMN_NAME]) : 'NULL'
                    )}
                  </td>
                ))}
              </tr>
            );
            })}
            {newRow && (
              <tr style={{ background: '#f0f8ff' }}>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button size="small" appearance="primary" onClick={saveNewRow}>
                      Save
                    </Button>
                    <Button size="small" onClick={() => setNewRow(null)}>
                      Cancel
                    </Button>
                  </div>
                </td>
                {tab.columns.map(col => (
                  <td key={col.COLUMN_NAME}>
                    <Input
                      value={newRow[col.COLUMN_NAME]}
                      onChange={(e) => setNewRow({ ...newRow, [col.COLUMN_NAME]: e.target.value })}
                      placeholder={col.DATA_TYPE}
                      size="small"
                      style={{ width: '100%' }}
                    />
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-info">
        Showing {tab.data.length} rows (double-click cell to edit)
      </div>
    </Card>
  );
}

// Function Tab Content Component
function FunctionTabContent({ tab, setTabs, tabs, setSelectedFunction, setFunctionParams, setParamValues, setShowRunDialog }) {
  const updateDefinition = (newDef) => {
    const updatedTabs = tabs.map(t => {
      if (t.id === tab.id) {
        return { ...t, definition: newDef };
      }
      return t;
    });
    setTabs(updatedTabs);
  };

  const saveFunctionDefinition = async () => {
    const result = await ipcRenderer.invoke('save-function', {
      connectionId: tab.connectionId,
      database: tab.database,
      schema: tab.function.ROUTINE_SCHEMA,
      name: tab.function.ROUTINE_NAME,
      definition: tab.definition,
      type: tab.function.ROUTINE_TYPE
    });

    if (result.success) {
      alert('Function saved successfully!');
    } else {
      alert('Save failed: ' + result.error);
    }
  };

  const handleRunFunction = async () => {
    const result = await ipcRenderer.invoke('get-function-parameters', {
      connectionId: tab.connectionId,
      database: tab.database,
      schema: tab.function.ROUTINE_SCHEMA,
      name: tab.function.ROUTINE_NAME
    });

    if (result.success) {
      setSelectedFunction(tab.function);
      setFunctionParams(result.parameters || []);
      setParamValues({});
      setShowRunDialog(true);
    } else {
      alert('Failed to get function parameters: ' + result.error);
    }
  };

  return (
    <div className="data-card" style={{ background: '#21252b', padding: 0 }}>
      <div className="function-toolbar">
        <div className="function-info">
          <span className="function-type">{tab.function.ROUTINE_TYPE}</span>
          <span className="function-name">{tab.function.ROUTINE_SCHEMA}.{tab.function.ROUTINE_NAME}</span>
        </div>
        <div className="function-actions-toolbar">
          <Button
            appearance="primary"
            size="small"
            onClick={handleRunFunction}
            icon={<Play20Regular />}
          >
            Run
          </Button>
          <Button
            appearance="secondary"
            size="small"
            onClick={saveFunctionDefinition}
          >
            Save
          </Button>
        </div>
      </div>
      <div className="function-editor">
        <textarea
          value={tab.definition}
          onChange={(e) => updateDefinition(e.target.value)}
          className="sql-editor"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function App() {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [tables, setTables] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [copiedTable, setCopiedTable] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'tables', 'functions', 'table-data', 'function-data'
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionDefinition, setFunctionDefinition] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [functionParams, setFunctionParams] = useState([]);
  const [paramValues, setParamValues] = useState({});
  const [executionResult, setExecutionResult] = useState(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [renameType, setRenameType] = useState(''); // 'table' or 'function'
  const [newName, setNewName] = useState('');
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [openTreeItems, setOpenTreeItems] = useState([]);
  const [viewType, setViewType] = useState('grid'); // 'grid', 'list', 'details'

  // Connection form
  const [connectionForm, setConnectionForm] = useState({
    server: 'localhost',
    user: 'sa',
    password: '',
    database: 'master',
    encrypt: false,
    trustServerCertificate: true
  });

  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showSmartSearchDialog, setShowSmartSearchDialog] = useState(false);
  const [smartSearchTerm, setSmartSearchTerm] = useState('');
  const [smartSearchResults, setSmartSearchResults] = useState({ tables: [], functions: [], data: [], suggestions: [] });
  const [targetDatabase, setTargetDatabase] = useState('');
  const [copyWithData, setCopyWithData] = useState(true);

  const handleConnect = async () => {
    const result = await ipcRenderer.invoke('connect-database', connectionForm);
    if (result.success) {
      const newConnection = {
        id: result.connectionId,
        name: `${connectionForm.server} - ${connectionForm.database}`,
        ...connectionForm
      };

      // Check if connection already exists
      const existingConnection = connections.find(c =>
        c.server === connectionForm.server &&
        c.user === connectionForm.user &&
        c.database === connectionForm.database
      );

      if (!existingConnection) {
        setConnections([...connections, newConnection]);
      }

      setSelectedConnection(newConnection);
      loadDatabases(result.connectionId);
    } else {
      alert('Connection failed: ' + result.error);
    }
  };

  const loadDatabases = async (connectionId) => {
    const result = await ipcRenderer.invoke('get-databases', connectionId);
    if (result.success) {
      setDatabases(result.databases);
    }
  };

  const loadTables = async (database) => {
    setSelectedDatabase(database);

    // Add database and tables/functions to open tree items
    const newOpenItems = [
      database,
      `${database}-tables`,
      `${database}-functions`
    ];
    setOpenTreeItems(newOpenItems);

    const result = await ipcRenderer.invoke('get-tables', {
      connectionId: selectedConnection.id,
      database
    });
    if (result.success) {
      setTables(result.tables);
    }

    const funcResult = await ipcRenderer.invoke('get-functions', {
      connectionId: selectedConnection.id,
      database
    });
    if (funcResult.success) {
      setFunctions(funcResult.functions);
    }
  };

  const showAllTables = () => {
    setViewMode('tables');
    setActiveTab(null); // Clear active tab to show grid
  };

  const showAllFunctions = () => {
    setViewMode('functions');
    setActiveTab(null); // Clear active tab to show grid
  };

  const loadTableData = async (table) => {
    // Set selected table for copy/paste functionality
    setSelectedTable(table);

    const tabId = `table-${selectedDatabase}-${table.TABLE_SCHEMA}-${table.TABLE_NAME}`;

    // Check if tab already exists
    const existingTab = tabs.find(t => t.id === tabId);
    if (existingTab) {
      setActiveTab(tabId);
      return;
    }

    const result = await ipcRenderer.invoke('get-table-data', {
      connectionId: selectedConnection.id,
      database: selectedDatabase,
      schema: table.TABLE_SCHEMA,
      table: table.TABLE_NAME
    });

    const structResult = await ipcRenderer.invoke('get-table-structure', {
      connectionId: selectedConnection.id,
      database: selectedDatabase,
      schema: table.TABLE_SCHEMA,
      table: table.TABLE_NAME
    });

    if (result.success && structResult.success) {
      const newTab = {
        id: tabId,
        title: `${table.TABLE_SCHEMA}.${table.TABLE_NAME}`,
        type: 'table',
        table,
        data: result.data,
        columns: structResult.columns,
        database: selectedDatabase,
        connectionId: selectedConnection.id,
        editingCell: null,
        editValue: ''
      };
      setTabs([...tabs, newTab]);
      setActiveTab(tabId);
    }
  };

  const loadFunctionDefinition = async (func) => {
    const tabId = `function-${selectedDatabase}-${func.ROUTINE_SCHEMA}-${func.ROUTINE_NAME}`;

    // Check if tab already exists
    const existingTab = tabs.find(t => t.id === tabId);
    if (existingTab) {
      setActiveTab(tabId);
      return;
    }

    const result = await ipcRenderer.invoke('get-function-definition', {
      connectionId: selectedConnection.id,
      database: selectedDatabase,
      schema: func.ROUTINE_SCHEMA,
      name: func.ROUTINE_NAME
    });

    if (result.success) {
      const newTab = {
        id: tabId,
        title: `${func.ROUTINE_SCHEMA}.${func.ROUTINE_NAME}`,
        type: 'function',
        function: func,
        definition: result.definition,
        database: selectedDatabase,
        connectionId: selectedConnection.id
      };
      setTabs([...tabs, newTab]);
      setActiveTab(tabId);
    }
  };

  const closeTab = (tabId) => {
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    } else if (newTabs.length === 0) {
      setActiveTab(null);
    }
  };

  const saveFunctionDefinition = async () => {
    const result = await ipcRenderer.invoke('save-function', {
      connectionId: selectedConnection.id,
      database: selectedDatabase,
      schema: selectedFunction.ROUTINE_SCHEMA,
      name: selectedFunction.ROUTINE_NAME,
      definition: functionDefinition,
      type: selectedFunction.ROUTINE_TYPE
    });

    if (result.success) {
      alert('Function saved successfully!');
    } else {
      alert('Save failed: ' + result.error);
    }
  };

  const handleRunFunction = async () => {
    const result = await ipcRenderer.invoke('get-function-parameters', {
      connectionId: selectedConnection.id,
      database: selectedDatabase,
      schema: selectedFunction.ROUTINE_SCHEMA,
      name: selectedFunction.ROUTINE_NAME
    });

    if (result.success) {
      setFunctionParams(result.parameters);
      const initialValues = {};
      result.parameters.forEach(param => {
        initialValues[param.PARAMETER_NAME] = '';
      });
      setParamValues(initialValues);
      setShowRunDialog(true);
      setExecutionResult(null);
    }
  };

  const executeFunction = async () => {
    const parameters = functionParams.map(param => ({
      name: param.PARAMETER_NAME,
      value: paramValues[param.PARAMETER_NAME] || ''
    }));

    const result = await ipcRenderer.invoke('execute-function', {
      connectionId: selectedConnection.id,
      database: selectedDatabase,
      schema: selectedFunction.ROUTINE_SCHEMA,
      name: selectedFunction.ROUTINE_NAME,
      type: selectedFunction.ROUTINE_TYPE,
      parameters
    });

    if (result.success) {
      setExecutionResult(result.result);
    } else {
      alert('Execution failed: ' + result.error);
    }
  };

  const handleDeleteTable = async (table) => {
    if (!confirm(`Are you sure you want to delete table ${table.TABLE_NAME}?`)) {
      return;
    }

    const result = await ipcRenderer.invoke('delete-table', {
      connectionId: selectedConnection.id,
      database: selectedDatabase,
      schema: table.TABLE_SCHEMA,
      table: table.TABLE_NAME
    });

    if (result.success) {
      alert('Table deleted successfully!');
      loadTables(selectedDatabase);
      if (selectedTable?.TABLE_NAME === table.TABLE_NAME) {
        setSelectedTable(null);
        setViewMode('tables');
      }
    } else {
      alert('Delete failed: ' + result.error);
    }
  };

  const handleRenameTable = (table) => {
    setRenameItem(table);
    setRenameType('table');
    setNewName(table.TABLE_NAME);
    setShowRenameDialog(true);
  };

  const handleRenameFunction = (func) => {
    setRenameItem(func);
    setRenameType('function');
    setNewName(func.ROUTINE_NAME);
    setShowRenameDialog(true);
  };

  const executeRename = async () => {
    if (!newName || newName.trim() === '') {
      alert('Please enter a valid name');
      return;
    }

    if (renameType === 'table') {
      const result = await ipcRenderer.invoke('rename-table', {
        connectionId: selectedConnection.id,
        database: selectedDatabase,
        schema: renameItem.TABLE_SCHEMA,
        oldName: renameItem.TABLE_NAME,
        newName: newName.trim()
      });

      if (result.success) {
        alert('Table renamed successfully!');
        setShowRenameDialog(false);
        loadTables(selectedDatabase);
        setViewMode('tables');
      } else {
        alert('Rename failed: ' + result.error);
      }
    } else if (renameType === 'function') {
      const result = await ipcRenderer.invoke('rename-function', {
        connectionId: selectedConnection.id,
        database: selectedDatabase,
        schema: renameItem.ROUTINE_SCHEMA,
        oldName: renameItem.ROUTINE_NAME,
        newName: newName.trim(),
        type: renameItem.ROUTINE_TYPE
      });

      if (result.success) {
        alert('Function/Procedure renamed successfully!');
        setShowRenameDialog(false);
        loadTables(selectedDatabase);
        setViewMode('functions');
      } else {
        alert('Rename failed: ' + result.error);
      }
    }
  };

  const handleCellEdit = (rowIndex, columnName, currentValue) => {
    setEditingCell({ rowIndex, columnName });
    setEditValue(currentValue || '');
  };

  const saveCellEdit = async (rowIndex, columnName) => {
    const row = tableData[rowIndex];
    const primaryKeyCol = tableColumns.find(col => col.COLUMN_NAME.toLowerCase().includes('id')) || tableColumns[0];

    const result = await ipcRenderer.invoke('update-cell', {
      connectionId: selectedConnection.id,
      database: selectedDatabase,
      schema: selectedTable.TABLE_SCHEMA,
      table: selectedTable.TABLE_NAME,
      column: columnName,
      value: editValue,
      primaryKey: primaryKeyCol.COLUMN_NAME,
      primaryKeyValue: row[primaryKeyCol.COLUMN_NAME]
    });

    if (result.success) {
      const newData = [...tableData];
      newData[rowIndex][columnName] = editValue;
      setTableData(newData);
      setEditingCell(null);
    } else {
      alert('Update failed: ' + result.error);
    }
  };

  const handleCopyTable = () => {
    if (selectedTable && selectedDatabase) {
      setCopiedTable({
        ...selectedTable,
        sourceDatabase: selectedDatabase,
        connectionId: selectedConnection.id
      });
      alert(`Table ${selectedTable.TABLE_NAME} copied! Select target database and paste.`);
    }
  };

  const handlePasteTable = () => {
    if (copiedTable && selectedDatabase) {
      setTargetDatabase(selectedDatabase);
      setShowCopyDialog(true);
    }
  };

  const executePaste = async () => {
    const result = await ipcRenderer.invoke('copy-table', {
      connectionId: copiedTable.connectionId,
      sourceDb: copiedTable.sourceDatabase,
      targetDb: targetDatabase,
      schema: copiedTable.TABLE_SCHEMA,
      table: copiedTable.TABLE_NAME,
      copyData: copyWithData
    });

    if (result.success) {
      alert('Table copied successfully!');
      setShowCopyDialog(false);
      loadTables(targetDatabase);
    } else {
      alert('Copy failed: ' + result.error);
    }
  };

  const performSmartSearch = async () => {
    if (!smartSearchTerm || !selectedDatabase) return;

    const results = { tables: [], functions: [], data: [], suggestions: [] };

    // Search tables
    const matchingTables = tables.filter(t =>
      t.TABLE_NAME.toLowerCase().includes(smartSearchTerm.toLowerCase()) ||
      t.TABLE_SCHEMA.toLowerCase().includes(smartSearchTerm.toLowerCase())
    );
    results.tables = matchingTables.slice(0, 10);

    // Search functions
    const matchingFunctions = functions.filter(f =>
      f.ROUTINE_NAME.toLowerCase().includes(smartSearchTerm.toLowerCase()) ||
      f.ROUTINE_SCHEMA.toLowerCase().includes(smartSearchTerm.toLowerCase())
    );
    results.functions = matchingFunctions.slice(0, 10);

    // Search within table data (search column names and row values)
    const dataMatches = [];
    for (const table of tables.slice(0, 20)) { // Limit to first 20 tables for performance
      try {
        const result = await ipcRenderer.invoke('search-table-data', {
          connectionId: selectedConnection.id,
          database: selectedDatabase,
          schema: table.TABLE_SCHEMA,
          table: table.TABLE_NAME,
          searchTerm: smartSearchTerm
        });

        if (result.success && result.matches && result.matches.length > 0) {
          dataMatches.push({
            table: table,
            matches: result.matches.slice(0, 3), // Top 3 matches per table
            totalMatches: result.matches.length
          });
        }
      } catch (err) {
        // Skip tables that fail to search
        console.error(`Failed to search table ${table.TABLE_NAME}:`, err);
      }
    }
    results.data = dataMatches.slice(0, 5); // Top 5 tables with matches

    // Generate suggestions based on similarity
    if (results.tables.length === 0 && results.functions.length === 0 && results.data.length === 0) {
      // Find similar items (simple Levenshtein-like matching)
      const allItems = [
        ...tables.map(t => ({ type: 'table', name: t.TABLE_NAME, item: t })),
        ...functions.map(f => ({ type: 'function', name: f.ROUTINE_NAME, item: f }))
      ];

      const suggestions = allItems
        .map(item => ({
          ...item,
          score: calculateSimilarity(smartSearchTerm.toLowerCase(), item.name.toLowerCase())
        }))
        .filter(item => item.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      results.suggestions = suggestions;
    }

    setSmartSearchResults(results);
  };

  // Simple similarity calculation
  const calculateSimilarity = (str1, str2) => {
    if (str1 === str2) return 1;
    if (str2.includes(str1)) return 0.8;
    if (str1.includes(str2)) return 0.7;

    const commonChars = str1.split('').filter(char => str2.includes(char)).length;
    return commonChars / Math.max(str1.length, str2.length);
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="app-container">
        {/* Top Toolbar */}
        <div className="toolbar">
          <div className="connection-form">
            <Input
              placeholder="Server"
              value={connectionForm.server}
              onChange={(e) => setConnectionForm({ ...connectionForm, server: e.target.value })}
              size="small"
              style={{ width: '120px' }}
            />
            <Input
              placeholder="User"
              value={connectionForm.user}
              onChange={(e) => setConnectionForm({ ...connectionForm, user: e.target.value })}
              size="small"
              style={{ width: '80px' }}
            />
            <Input
              placeholder="Password"
              type="password"
              value={connectionForm.password}
              onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
              size="small"
              style={{ width: '100px' }}
            />
            <Input
              placeholder="Database"
              value={connectionForm.database}
              onChange={(e) => setConnectionForm({ ...connectionForm, database: e.target.value })}
              size="small"
              style={{ width: '100px' }}
            />
            <Button appearance="primary" onClick={handleConnect} icon={<CloudDatabase20Regular />}>
              Connect
            </Button>
          </div>
          <div className="actions">
            <Button
              onClick={() => setShowSmartSearchDialog(true)}
              disabled={!selectedDatabase}
              icon={<Search20Regular />}
              appearance="primary"
            >
              Smart Search
            </Button>
            <Button onClick={handleCopyTable} disabled={!selectedTable} icon={<Copy20Regular />}>
              Copy Table
            </Button>
            <Button onClick={handlePasteTable} disabled={!copiedTable}>
              Paste to {selectedDatabase}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Left Panel - Navigation Tree */}
          <div className="left-panel">
            <Card className="nav-card">
              <h3>Connections</h3>
              <div className="connections-container">
                {connections.map(conn => (
                  <div key={conn.id} className="connection-item">
                  <strong>{conn.name}</strong>
                  {selectedConnection?.id === conn.id && (
                    <Tree aria-label="Databases" openItems={openTreeItems} onOpenChange={(e, data) => setOpenTreeItems(data.openItems)}>
                      {databases.map(db => (
                        <TreeItem
                          key={db}
                          value={db}
                          itemType="branch"
                        >
                          <TreeItemLayout
                            iconBefore={<Database20Regular />}
                            onClick={() => loadTables(db)}
                          >
                            {db}
                          </TreeItemLayout>
                          {selectedDatabase === db && (
                          <>
                            <Tree>
                              <TreeItem itemType="branch" value={`${db}-tables`}>
                                <TreeItemLayout onClick={showAllTables}>Tables ({tables.length})</TreeItemLayout>
                                <Tree>
                                  {tables.map(table => (
                                    <TreeItem key={table.TABLE_NAME} value={`table-${table.TABLE_NAME}`}>
                                      <TreeItemLayout
                                        iconBefore={<Table20Regular />}
                                        onClick={() => loadTableData(table)}
                                      >
                                        {table.TABLE_NAME}
                                      </TreeItemLayout>
                                    </TreeItem>
                                  ))}
                                </Tree>
                              </TreeItem>
                              <TreeItem itemType="branch" value={`${db}-functions`}>
                                <TreeItemLayout onClick={showAllFunctions}>Functions ({functions.length})</TreeItemLayout>
                                <Tree>
                                  {functions.map(func => (
                                    <TreeItem key={func.ROUTINE_NAME} value={`func-${func.ROUTINE_NAME}`}>
                                      <TreeItemLayout
                                        iconBefore={<Code20Regular />}
                                        onClick={() => loadFunctionDefinition(func)}
                                      >
                                        {func.ROUTINE_NAME}
                                      </TreeItemLayout>
                                    </TreeItem>
                                  ))}
                                </Tree>
                              </TreeItem>
                            </Tree>
                          </>
                        )}
                      </TreeItem>
                    ))}
                    </Tree>
                  )}
                </div>
              ))}
              </div>
            </Card>
          </div>

          {/* Right Panel - Data Grid */}
          <div className="right-panel">
            {/* Tab Bar */}
            {tabs.length > 0 && (
              <div className="tab-bar-wrapper">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ChevronLeft20Regular />}
                  onClick={() => {
                    const container = document.querySelector('.tab-bar');
                    container.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  className="tab-nav-arrow"
                />
                <div className="tab-bar">
                  <TabList selectedValue={activeTab} onTabSelect={(e, data) => setActiveTab(data.value)}>
                    {tabs.map(tab => (
                      <Tab key={tab.id} value={tab.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {tab.type === 'table' ? <Table20Regular /> : <Code20Regular />}
                          <span>{tab.title}</span>
                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<Dismiss20Regular />}
                            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                            style={{ marginLeft: '4px', minWidth: '20px', padding: '2px' }}
                          />
                        </div>
                      </Tab>
                    ))}
                  </TabList>
                </div>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ChevronRight20Regular />}
                  onClick={() => {
                    const container = document.querySelector('.tab-bar');
                    container.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                  className="tab-nav-arrow"
                />
              </div>
            )}

            {/* Tab Content */}
            {tabs.length > 0 && tabs.map(tab => (
              <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none', height: '100%' }}>
                {tab.type === 'table' && (
                  <TableTabContent tab={tab} setTabs={setTabs} tabs={tabs} />
                )}
                {tab.type === 'function' && (
                  <FunctionTabContent
                    tab={tab}
                    setTabs={setTabs}
                    tabs={tabs}
                    setSelectedFunction={setSelectedFunction}
                    setFunctionParams={setFunctionParams}
                    setParamValues={setParamValues}
                    setShowRunDialog={setShowRunDialog}
                  />
                )}
              </div>
            ))}

            {/* Grid Views */}
            {!activeTab && viewMode === 'tables' && (
              <Card className="data-card">
                <div className="card-header">
                  <h3>All Tables in {selectedDatabase}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button
                        size="small"
                        appearance={viewType === 'grid' ? 'primary' : 'subtle'}
                        icon={<Grid20Regular />}
                        onClick={() => setViewType('grid')}
                        title="Grid View"
                      />
                      <Button
                        size="small"
                        appearance={viewType === 'list' ? 'primary' : 'subtle'}
                        icon={<List20Regular />}
                        onClick={() => setViewType('list')}
                        title="List View"
                      />
                      <Button
                        size="small"
                        appearance={viewType === 'details' ? 'primary' : 'subtle'}
                        icon={<DocumentTableArrowRight20Regular />}
                        onClick={() => setViewType('details')}
                        title="Details View"
                      />
                    </div>
                    <Input
                      placeholder="Search tables..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      contentBefore={<Search20Regular />}
                      style={{ width: '250px' }}
                    />
                  </div>
                </div>
                {viewType === 'grid' && (
                  <div className="grid-container">
                  {tables
                    .filter(table =>
                      table.TABLE_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      table.TABLE_SCHEMA.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((table, idx) => (
                      <Card key={idx} className="grid-item">
                        <div className="grid-item-main" onClick={() => loadTableData(table)}>
                          <div className="grid-item-icon">
                            <Table20Regular />
                          </div>
                          <div className="grid-item-content">
                            <div className="grid-item-title">{table.TABLE_NAME}</div>
                            <div className="grid-item-subtitle">{table.TABLE_SCHEMA}</div>
                          </div>
                        </div>
                        <div className="grid-item-actions">
                          <Button
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleRenameTable(table); }}
                          >
                            Rename
                          </Button>
                          <Button
                            size="small"
                            appearance="primary"
                            onClick={(e) => { e.stopPropagation(); handleDeleteTable(table); }}
                            style={{ backgroundColor: '#d13438', borderColor: '#d13438' }}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                {viewType === 'list' && (
                  <div className="list-container">
                    {tables
                      .filter(table =>
                        table.TABLE_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        table.TABLE_SCHEMA.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((table, idx) => (
                        <div key={idx} className="list-item" onClick={() => loadTableData(table)}>
                          <Table20Regular />
                          <span className="list-item-name">{table.TABLE_SCHEMA}.{table.TABLE_NAME}</span>
                          <div className="list-item-actions">
                            <Button
                              size="small"
                              appearance="subtle"
                              onClick={(e) => { e.stopPropagation(); handleRenameTable(table); }}
                            >
                              Rename
                            </Button>
                            <Button
                              size="small"
                              appearance="subtle"
                              onClick={(e) => { e.stopPropagation(); handleDeleteTable(table); }}
                              style={{ color: 'red' }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {viewType === 'details' && (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Table Name</th>
                          <th>Schema</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tables
                          .filter(table =>
                            table.TABLE_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            table.TABLE_SCHEMA.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((table, idx) => (
                            <tr key={idx} onClick={() => loadTableData(table)} style={{ cursor: 'pointer' }}>
                              <td>{table.TABLE_NAME}</td>
                              <td>{table.TABLE_SCHEMA}</td>
                              <td>
                                <Button
                                  size="small"
                                  appearance="subtle"
                                  onClick={(e) => { e.stopPropagation(); handleRenameTable(table); }}
                                >
                                  Rename
                                </Button>
                                <Button
                                  size="small"
                                  appearance="subtle"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTable(table); }}
                                  style={{ color: 'red' }}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {!activeTab && viewMode === 'functions' && (
              <Card className="data-card">
                <div className="card-header">
                  <h3>All Functions in {selectedDatabase}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="view-switcher">
                      <Button
                        appearance={viewType === 'grid' ? 'primary' : 'subtle'}
                        size="small"
                        icon={<Grid20Regular />}
                        onClick={() => setViewType('grid')}
                      >
                        Grid
                      </Button>
                      <Button
                        appearance={viewType === 'list' ? 'primary' : 'subtle'}
                        size="small"
                        icon={<List20Regular />}
                        onClick={() => setViewType('list')}
                      >
                        List
                      </Button>
                      <Button
                        appearance={viewType === 'details' ? 'primary' : 'subtle'}
                        size="small"
                        icon={<Table20Regular />}
                        onClick={() => setViewType('details')}
                      >
                        Details
                      </Button>
                    </div>
                    <Input
                      placeholder="Search functions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      contentBefore={<Search20Regular />}
                      style={{ width: '300px' }}
                    />
                  </div>
                </div>

                {viewType === 'grid' && (
                  <div className="grid-container">
                    {functions
                      .filter(func =>
                        func.ROUTINE_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        func.ROUTINE_SCHEMA.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((func, idx) => (
                        <Card key={idx} className="grid-item">
                          <div className="grid-item-main" onClick={() => loadFunctionDefinition(func)}>
                            <div className="grid-item-icon">
                              <Code20Regular />
                            </div>
                            <div className="grid-item-content">
                              <div className="grid-item-title">{func.ROUTINE_NAME}</div>
                              <div className="grid-item-subtitle">{func.ROUTINE_SCHEMA} - {func.ROUTINE_TYPE}</div>
                            </div>
                          </div>
                          <div className="grid-item-actions">
                            <Button
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleRenameFunction(func); }}
                            >
                              Rename
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}

                {viewType === 'list' && (
                  <div className="list-container">
                    {functions
                      .filter(func =>
                        func.ROUTINE_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        func.ROUTINE_SCHEMA.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((func, idx) => (
                        <div key={idx} className="list-item">
                          <Code20Regular style={{ color: '#0078d4' }} />
                          <div className="list-item-name" onClick={() => loadFunctionDefinition(func)}>
                            {func.ROUTINE_SCHEMA}.{func.ROUTINE_NAME} ({func.ROUTINE_TYPE})
                          </div>
                          <div className="list-item-actions">
                            <Button
                              size="small"
                              appearance="subtle"
                              onClick={(e) => { e.stopPropagation(); handleRenameFunction(func); }}
                            >
                              Rename
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {viewType === 'details' && (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Schema</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {functions
                          .filter(func =>
                            func.ROUTINE_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            func.ROUTINE_SCHEMA.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((func, idx) => (
                            <tr key={idx} style={{ cursor: 'pointer' }}>
                              <td onClick={() => loadFunctionDefinition(func)}>{func.ROUTINE_NAME}</td>
                              <td onClick={() => loadFunctionDefinition(func)}>{func.ROUTINE_SCHEMA}</td>
                              <td onClick={() => loadFunctionDefinition(func)}>{func.ROUTINE_TYPE}</td>
                              <td>
                                <Button
                                  size="small"
                                  appearance="subtle"
                                  onClick={(e) => { e.stopPropagation(); handleRenameFunction(func); }}
                                >
                                  Rename
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

          </div>
        </div>

        {/* Run Function Dialog */}
        <Dialog open={showRunDialog} onOpenChange={(e, data) => setShowRunDialog(data.open)}>
          <DialogSurface style={{ maxWidth: '600px' }}>
            <DialogBody>
              <DialogTitle>Run {selectedFunction?.ROUTINE_TYPE}: {selectedFunction?.ROUTINE_NAME}</DialogTitle>
              <DialogContent>
                {functionParams.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {functionParams.map((param) => (
                      <Field key={param.PARAMETER_NAME} label={`${param.PARAMETER_NAME} (${param.DATA_TYPE})`}>
                        <Input
                          value={paramValues[param.PARAMETER_NAME] || ''}
                          onChange={(e) => setParamValues({ ...paramValues, [param.PARAMETER_NAME]: e.target.value })}
                          placeholder={`Enter ${param.DATA_TYPE} value`}
                        />
                      </Field>
                    ))}
                  </div>
                ) : (
                  <p>No parameters required</p>
                )}
                {executionResult && (
                  <div style={{ marginTop: '16px' }}>
                    <h4>Results:</h4>
                    <div className="table-container" style={{ maxHeight: '300px' }}>
                      {executionResult.map((resultSet, idx) => (
                        <table key={idx} className="data-table" style={{ marginBottom: '12px' }}>
                          <thead>
                            <tr>
                              {Object.keys(resultSet[0] || {}).map(key => (
                                <th key={key}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {resultSet.map((row, rowIdx) => (
                              <tr key={rowIdx}>
                                {Object.values(row).map((val, valIdx) => (
                                  <td key={valIdx}>{val !== null ? String(val) : 'NULL'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ))}
                    </div>
                  </div>
                )}
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setShowRunDialog(false)}>
                  Close
                </Button>
                <Button appearance="primary" onClick={executeFunction}>
                  Execute
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog open={showRenameDialog} onOpenChange={(e, data) => setShowRenameDialog(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Rename {renameType === 'table' ? 'Table' : 'Function/Procedure'}</DialogTitle>
              <DialogContent>
                <Field label={`New ${renameType === 'table' ? 'Table' : 'Function/Procedure'} Name`}>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    autoFocus
                  />
                </Field>
                <p style={{ marginTop: '12px', color: '#605e5c', fontSize: '12px' }}>
                  Current: {renameType === 'table' ? renameItem?.TABLE_NAME : renameItem?.ROUTINE_NAME}
                </p>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setShowRenameDialog(false)}>
                  Cancel
                </Button>
                <Button appearance="primary" onClick={executeRename}>
                  Rename
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Copy Dialog */}
        <Dialog open={showCopyDialog} onOpenChange={(e, data) => setShowCopyDialog(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Copy Table</DialogTitle>
              <DialogContent>
                <p>
                  Copy table <strong>{copiedTable?.TABLE_NAME}</strong> from{' '}
                  <strong>{copiedTable?.sourceDatabase}</strong> to{' '}
                  <strong>{targetDatabase}</strong>?
                </p>
                <Field>
                  <Checkbox
                    checked={copyWithData}
                    onChange={(e, data) => setCopyWithData(data.checked)}
                    label="Copy data (include all rows)"
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setShowCopyDialog(false)}>
                  Cancel
                </Button>
                <Button appearance="primary" onClick={executePaste}>
                  Copy Table
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Smart Search Dialog */}
        <Dialog
          open={showSmartSearchDialog}
          onOpenChange={(e, data) => {
            setShowSmartSearchDialog(data.open);
            // Reset dialog when closing
            if (!data.open) {
              setSmartSearchTerm('');
              setSmartSearchResults({ tables: [], functions: [], data: [], suggestions: [] });
            }
          }}
        >
          <DialogSurface style={{ maxWidth: '700px', maxHeight: '80vh' }}>
            <DialogBody>
              <DialogTitle>Smart Search in {selectedDatabase}</DialogTitle>
              <DialogContent style={{ maxHeight: '60vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <Input
                    placeholder="Search tables, functions, data..."
                    value={smartSearchTerm}
                    onChange={(e) => {
                      setSmartSearchTerm(e.target.value);
                      // Auto-search as you type
                      if (e.target.value.trim()) {
                        performSmartSearch();
                      } else {
                        // Clear results when input is empty
                        setSmartSearchResults({ tables: [], functions: [], data: [], suggestions: [] });
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') performSmartSearch(); }}
                    contentBefore={<Search20Regular />}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <Button appearance="primary" onClick={performSmartSearch} disabled={!smartSearchTerm.trim()}>
                    Search
                  </Button>
                </div>

                <div style={{ minHeight: '200px' }}>
                  {smartSearchResults.tables.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#0078d4', fontWeight: '600' }}>
                        📊 Tables ({smartSearchResults.tables.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {smartSearchResults.tables.map((table, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '10px 12px',
                              background: '#f9f9f9',
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f0f0f0';
                              e.currentTarget.style.borderColor = '#0078d4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f9f9f9';
                              e.currentTarget.style.borderColor = '#e0e0e0';
                            }}
                            onClick={() => {
                              loadTableData(table);
                              setShowSmartSearchDialog(false);
                              setSmartSearchTerm('');
                              setSmartSearchResults({ tables: [], functions: [], data: [], suggestions: [] });
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                              {table.TABLE_SCHEMA}.{table.TABLE_NAME}
                            </div>
                            <div style={{ color: '#605e5c', fontSize: '10px' }}>Click to open table</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {smartSearchResults.functions.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#0078d4', fontWeight: '600' }}>
                        ⚙️ Functions ({smartSearchResults.functions.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {smartSearchResults.functions.map((func, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '10px 12px',
                              background: '#f9f9f9',
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f0f0f0';
                              e.currentTarget.style.borderColor = '#0078d4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f9f9f9';
                              e.currentTarget.style.borderColor = '#e0e0e0';
                            }}
                            onClick={() => {
                              loadFunctionDefinition(func);
                              setShowSmartSearchDialog(false);
                              setSmartSearchTerm('');
                              setSmartSearchResults({ tables: [], functions: [], data: [], suggestions: [] });
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                              {func.ROUTINE_SCHEMA}.{func.ROUTINE_NAME}
                            </div>
                            <div style={{ color: '#605e5c', fontSize: '10px' }}>
                              {func.ROUTINE_TYPE} · Click to open
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {smartSearchResults.data && smartSearchResults.data.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#107c10', fontWeight: '600' }}>
                        🔎 Data Matches ({smartSearchResults.data.reduce((sum, d) => sum + d.totalMatches, 0)} rows)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {smartSearchResults.data.map((dataMatch, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '10px 12px',
                              background: '#f0f9ff',
                              border: '1px solid #b3d9ff',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e6f4ff';
                              e.currentTarget.style.borderColor = '#66b3ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f0f9ff';
                              e.currentTarget.style.borderColor = '#b3d9ff';
                            }}
                            onClick={() => {
                              loadTableData(dataMatch.table);
                              setShowSmartSearchDialog(false);
                              setSmartSearchTerm('');
                              setSmartSearchResults({ tables: [], functions: [], data: [], suggestions: [] });
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                              {dataMatch.table.TABLE_SCHEMA}.{dataMatch.table.TABLE_NAME}
                            </div>
                            <div style={{ color: '#004578', fontSize: '10px', marginBottom: '4px' }}>
                              Found {dataMatch.totalMatches} matching row{dataMatch.totalMatches > 1 ? 's' : ''}
                            </div>
                            {dataMatch.matches.map((match, mIdx) => (
                              <div key={mIdx} style={{
                                fontSize: '10px',
                                color: '#666',
                                marginTop: '2px',
                                paddingLeft: '8px',
                                borderLeft: '2px solid #66b3ff'
                              }}>
                                <strong>{match.column}:</strong> {String(match.value).substring(0, 50)}{String(match.value).length > 50 ? '...' : ''}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {smartSearchResults.suggestions && smartSearchResults.suggestions.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#ff8c00', fontWeight: '600' }}>
                        💡 Did you mean...?
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {smartSearchResults.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '10px 12px',
                              background: '#fff8e6',
                              border: '1px solid #ffe066',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fff4cc';
                              e.currentTarget.style.borderColor = '#ffd633';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fff8e6';
                              e.currentTarget.style.borderColor = '#ffe066';
                            }}
                            onClick={() => {
                              if (suggestion.type === 'table') {
                                loadTableData(suggestion.item);
                              } else {
                                loadFunctionDefinition(suggestion.item);
                              }
                              setShowSmartSearchDialog(false);
                              setSmartSearchTerm('');
                              setSmartSearchResults({ tables: [], functions: [], data: [], suggestions: [] });
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '2px' }}>{suggestion.name}</div>
                            <div style={{ color: '#806600', fontSize: '10px' }}>
                              {suggestion.type} · {Math.round(suggestion.score * 100)}% match
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!smartSearchTerm && smartSearchResults.tables.length === 0 &&
                   smartSearchResults.functions.length === 0 &&
                   (!smartSearchResults.suggestions || smartSearchResults.suggestions.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '48px 32px', color: '#605e5c' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔎</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                        Search across tables and functions
                      </div>
                      <div style={{ fontSize: '11px', color: '#8a8886' }}>
                        Start typing to see results instantly
                      </div>
                    </div>
                  )}

                  {smartSearchTerm && smartSearchResults.tables.length === 0 &&
                   smartSearchResults.functions.length === 0 &&
                   smartSearchResults.data.length === 0 &&
                   (!smartSearchResults.suggestions || smartSearchResults.suggestions.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '48px 32px', color: '#605e5c' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                        No results found for "{smartSearchTerm}"
                      </div>
                      <div style={{ fontSize: '11px', color: '#8a8886' }}>
                        Try different keywords or check spelling
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setShowSmartSearchDialog(false);
                  setSmartSearchTerm('');
                  setSmartSearchResults({ tables: [], functions: [], data: [], suggestions: [] });
                }}>
                  Close
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>
    </FluentProvider>
  );
}

export default App;
