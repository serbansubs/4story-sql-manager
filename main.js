const { app, BrowserWindow, ipcMain } = require('electron');
const sql = require('mssql');
const path = require('path');

let mainWindow;
const connections = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('build/index.html');
  // mainWindow.webContents.openDevTools(); // Disabled for production
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('connect-database', async (event, config) => {
  try {
    const pool = await sql.connect({
      server: config.server,
      user: config.user,
      password: config.password,
      database: config.database,
      options: {
        encrypt: config.encrypt || false,
        trustServerCertificate: config.trustServerCertificate || true
      }
    });

    const connectionId = `${config.server}_${Date.now()}`;
    connections.set(connectionId, pool);

    return { success: true, connectionId };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-databases', async (event, connectionId) => {
  try {
    const pool = connections.get(connectionId);
    const result = await pool.request().query('SELECT name FROM sys.databases ORDER BY name');
    return { success: true, databases: result.recordset.map(r => r.name) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-tables', async (event, { connectionId, database }) => {
  try {
    const pool = connections.get(connectionId);
    const result = await pool.request()
      .input('database', sql.NVarChar, database)
      .query(`USE [${database}]; SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`);
    return { success: true, tables: result.recordset };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-functions', async (event, { connectionId, database }) => {
  try {
    const pool = connections.get(connectionId);
    const result = await pool.request()
      .query(`USE [${database}]; SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE FROM INFORMATION_SCHEMA.ROUTINES ORDER BY ROUTINE_NAME`);
    return { success: true, functions: result.recordset };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-table-data', async (event, { connectionId, database, schema, table }) => {
  try {
    const pool = connections.get(connectionId);
    const result = await pool.request()
      .query(`USE [${database}]; SELECT TOP 1000 * FROM [${schema}].[${table}]`);
    return { success: true, data: result.recordset };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-table-structure', async (event, { connectionId, database, schema, table }) => {
  try {
    const pool = connections.get(connectionId);
    const result = await pool.request()
      .query(`USE [${database}];
        SELECT
          c.COLUMN_NAME, c.DATA_TYPE, c.CHARACTER_MAXIMUM_LENGTH,
          c.IS_NULLABLE, c.COLUMN_DEFAULT,
          CASE
            WHEN pk.COLUMN_NAME IS NOT NULL THEN 1
            ELSE 0
          END AS IS_PRIMARY_KEY
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN (
          SELECT ku.COLUMN_NAME
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
            ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
            AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
            AND tc.TABLE_SCHEMA = ku.TABLE_SCHEMA
            AND tc.TABLE_NAME = ku.TABLE_NAME
          WHERE tc.TABLE_SCHEMA = '${schema}' AND tc.TABLE_NAME = '${table}'
        ) pk ON c.COLUMN_NAME = pk.COLUMN_NAME
        WHERE c.TABLE_SCHEMA = '${schema}' AND c.TABLE_NAME = '${table}'
        ORDER BY c.ORDINAL_POSITION`);
    return { success: true, columns: result.recordset };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('copy-table', async (event, { connectionId, sourceDb, targetDb, schema, table, copyData }) => {
  try {
    const pool = connections.get(connectionId);

    // Get table structure
    const columnsResult = await pool.request()
      .query(`USE [${sourceDb}];
        SELECT
          COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE, COLUMN_DEFAULT,
          COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') as IS_IDENTITY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${schema}' AND TABLE_NAME = '${table}'
        ORDER BY ORDINAL_POSITION`);

    const columns = columnsResult.recordset;

    // Build CREATE TABLE statement
    let createTableSQL = `USE [${targetDb}];
      IF OBJECT_ID('[${schema}].[${table}]', 'U') IS NOT NULL DROP TABLE [${schema}].[${table}];
      CREATE TABLE [${schema}].[${table}] (`;

    const columnDefs = columns.map(col => {
      let def = `[${col.COLUMN_NAME}] ${col.DATA_TYPE}`;
      if (col.CHARACTER_MAXIMUM_LENGTH && col.CHARACTER_MAXIMUM_LENGTH > 0) {
        def += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
      } else if (col.DATA_TYPE === 'nvarchar' || col.DATA_TYPE === 'varchar') {
        def += '(MAX)';
      }
      if (col.IS_IDENTITY) def += ' IDENTITY(1,1)';
      if (col.IS_NULLABLE === 'NO') def += ' NOT NULL';
      if (col.COLUMN_DEFAULT) def += ` DEFAULT ${col.COLUMN_DEFAULT}`;
      return def;
    });

    createTableSQL += columnDefs.join(', ') + ')';

    await pool.request().query(createTableSQL);

    // Copy data if requested
    if (copyData) {
      const hasIdentity = columns.some(col => col.IS_IDENTITY);

      if (hasIdentity) {
        await pool.request()
          .query(`USE [${targetDb}];
            SET IDENTITY_INSERT [${schema}].[${table}] ON;
            INSERT INTO [${schema}].[${table}]
            SELECT * FROM [${sourceDb}].[${schema}].[${table}];
            SET IDENTITY_INSERT [${schema}].[${table}] OFF;`);
      } else {
        await pool.request()
          .query(`USE [${targetDb}];
            INSERT INTO [${schema}].[${table}]
            SELECT * FROM [${sourceDb}].[${schema}].[${table}];`);
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-cell', async (event, { connectionId, database, schema, table, column, value, primaryKey, primaryKeyValue }) => {
  try {
    // Safety check - prevent updates without proper primary key
    if (!primaryKey || primaryKeyValue === undefined || primaryKeyValue === null) {
      return { success: false, error: 'Cannot update: Primary key or value is missing' };
    }

    const pool = connections.get(connectionId);
    const result = await pool.request()
      .input('value', value)
      .input('pkValue', primaryKeyValue)
      .query(`USE [${database}]; UPDATE [${schema}].[${table}] SET [${column}] = @value WHERE [${primaryKey}] = @pkValue`);

    // Check if exactly one row was updated
    if (result.rowsAffected[0] !== 1) {
      return { success: false, error: `Update affected ${result.rowsAffected[0]} rows instead of 1. Operation cancelled.` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-function-definition', async (event, { connectionId, database, schema, name }) => {
  try {
    const pool = connections.get(connectionId);
    const result = await pool.request()
      .query(`USE [${database}]; SELECT OBJECT_DEFINITION(OBJECT_ID('${schema}.${name}')) AS definition`);
    return { success: true, definition: result.recordset[0].definition || 'No definition available' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-function', async (event, { connectionId, database, schema, name, definition, type }) => {
  try {
    const pool = connections.get(connectionId);

    // Drop and recreate the function/procedure
    const dropCmd = type === 'PROCEDURE' ? 'DROP PROCEDURE' : 'DROP FUNCTION';
    await pool.request()
      .query(`USE [${database}]; ${dropCmd} IF EXISTS [${schema}].[${name}]`);

    await pool.request()
      .query(`USE [${database}]; ${definition}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-function-parameters', async (event, { connectionId, database, schema, name }) => {
  try {
    const pool = connections.get(connectionId);
    const result = await pool.request()
      .query(`USE [${database}];
        SELECT
          PARAMETER_NAME,
          DATA_TYPE,
          PARAMETER_MODE,
          CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.PARAMETERS
        WHERE SPECIFIC_SCHEMA = '${schema}' AND SPECIFIC_NAME = '${name}'
        ORDER BY ORDINAL_POSITION`);
    return { success: true, parameters: result.recordset };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('execute-function', async (event, { connectionId, database, schema, name, type, parameters }) => {
  try {
    const pool = connections.get(connectionId);
    const request = pool.request();

    // Use the database
    await request.query(`USE [${database}]`);

    if (type === 'PROCEDURE') {
      // Build the EXEC command with parameters
      let execQuery = `EXEC [${schema}].[${name}]`;

      if (parameters && parameters.length > 0) {
        // Add parameters to the request and build the exec string
        const paramList = [];
        parameters.forEach((param) => {
          const paramName = param.name.replace('@', '');
          request.input(paramName, param.value);
          paramList.push(`@${paramName} = @${paramName}`);
        });
        execQuery += ' ' + paramList.join(', ');
      }

      const result = await request.query(execQuery);

      // Return all recordsets or a success message
      if (result.recordsets && result.recordsets.length > 0) {
        return { success: true, result: result.recordsets };
      } else {
        return { success: true, result: [[{ Message: 'Procedure executed successfully', RowsAffected: result.rowsAffected[0] || 0 }]] };
      }
    } else {
      // For functions, build the SELECT statement
      let selectQuery = `SELECT [${schema}].[${name}](`;

      if (parameters && parameters.length > 0) {
        const paramList = [];
        parameters.forEach((param, index) => {
          const paramName = `param${index}`;
          request.input(paramName, param.value);
          paramList.push(`@${paramName}`);
        });
        selectQuery += paramList.join(', ');
      }

      selectQuery += `) AS Result`;

      const result = await request.query(selectQuery);
      return { success: true, result: result.recordsets };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-table', async (event, { connectionId, database, schema, table }) => {
  try {
    const pool = connections.get(connectionId);
    await pool.request()
      .query(`USE [${database}]; DROP TABLE [${schema}].[${table}]`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('rename-table', async (event, { connectionId, database, schema, oldName, newName }) => {
  try {
    const pool = connections.get(connectionId);
    await pool.request()
      .query(`USE [${database}]; EXEC sp_rename '[${schema}].[${oldName}]', '${newName}'`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('search-table-data', async (event, { connectionId, database, schema, table, searchTerm }) => {
  try {
    const pool = connections.get(connectionId);

    // Get all columns for the table
    const columnsResult = await pool.request()
      .query(`USE [${database}];
              SELECT COLUMN_NAME, DATA_TYPE
              FROM INFORMATION_SCHEMA.COLUMNS
              WHERE TABLE_SCHEMA = '${schema}' AND TABLE_NAME = '${table}'`);

    const columns = columnsResult.recordset;

    // Build search query for all text/varchar columns
    const searchableColumns = columns.filter(col =>
      col.DATA_TYPE.includes('char') ||
      col.DATA_TYPE.includes('text') ||
      col.DATA_TYPE === 'nvarchar' ||
      col.DATA_TYPE === 'varchar'
    );

    if (searchableColumns.length === 0) {
      return { success: true, matches: [] };
    }

    // Build WHERE clause to search across all searchable columns
    const whereConditions = searchableColumns.map(col =>
      `CAST([${col.COLUMN_NAME}] AS NVARCHAR(MAX)) LIKE '%${searchTerm}%'`
    ).join(' OR ');

    // Get matching rows (limit to 100 for performance)
    const dataResult = await pool.request()
      .query(`USE [${database}];
              SELECT TOP 100 *
              FROM [${schema}].[${table}]
              WHERE ${whereConditions}`);

    // Format matches to show which column matched
    const matches = [];
    for (const row of dataResult.recordset) {
      for (const col of searchableColumns) {
        const value = row[col.COLUMN_NAME];
        if (value && String(value).toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push({
            column: col.COLUMN_NAME,
            value: value,
            row: row
          });
          break; // Only add one match per row
        }
      }
    }

    return { success: true, matches };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('rename-function', async (event, { connectionId, database, schema, oldName, newName, type }) => {
  try {
    const pool = connections.get(connectionId);
    const objectType = type === 'PROCEDURE' ? 'PROCEDURE' : 'FUNCTION';
    await pool.request()
      .query(`USE [${database}]; EXEC sp_rename '[${schema}].[${oldName}]', '${newName}', 'OBJECT'`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('insert-row', async (event, { connectionId, database, schema, table, rowData }) => {
  try {
    const pool = connections.get(connectionId);

    const columns = Object.keys(rowData).filter(k => rowData[k] !== null && rowData[k] !== '');
    const values = columns.map(col => {
      const val = rowData[col];
      return val === null || val === '' ? 'NULL' : `'${val}'`;
    });

    const columnList = columns.map(c => `[${c}]`).join(', ');
    const valueList = values.join(', ');

    await pool.request()
      .query(`USE [${database}]; INSERT INTO [${schema}].[${table}] (${columnList}) VALUES (${valueList})`);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-row', async (event, { connectionId, database, schema, table, primaryKey, primaryKeyValue }) => {
  try {
    const pool = connections.get(connectionId);

    await pool.request()
      .input('pkValue', primaryKeyValue)
      .query(`USE [${database}]; DELETE FROM [${schema}].[${table}] WHERE [${primaryKey}] = @pkValue`);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
