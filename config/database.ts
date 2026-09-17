import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries.
   */
  connection: env.get('DB_CONNECTION', 'postgres'),

  /**
   * Pretty-print SQL debug output in development logs.
   */
  prettyPrintDebugQueries: true,

  connections: {
    /**
     * PostgreSQL connection configured for Supabase.
     * Supports both Supabase connection string (DATABASE_URL)
     * and discrete host/credentials parameters.
     */
    postgres: {
      client: 'pg',
      connection: env.get('DATABASE_URL')
        ? {
            connectionString: env.get('DATABASE_URL'),
            ssl: env.get('DB_SSL', true) ? { rejectUnauthorized: false } : false,
          }
        : {
            host: env.get('DB_HOST', '127.0.0.1'),
            port: env.get('DB_PORT', 5432),
            user: env.get('DB_USER', 'postgres'),
            password: env.get('DB_PASSWORD', ''),
            database: env.get('DB_DATABASE', 'postgres'),
            ssl: env.get('DB_SSL', true) ? { rejectUnauthorized: false } : false,
          },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },

    /**
     * SQLite connection (local development & testing).
     */
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath('db.sqlite3'),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },


    /**
     * MySQL / MariaDB connection.
     * Install package to switch: npm install mysql2
     */
    // mysql: {
    //   client: 'mysql2',
    //   connection: {
    //     host: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * Microsoft SQL Server connection.
     * Install package to switch: npm install tedious
     */
    // mssql: {
    //   client: 'mssql',
    //   connection: {
    //     server: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * libSQL (Turso) connection.
     * Install package to switch: npm install @libsql/client
     */
    // libsql: {
    //   client: 'libsql',
    //   connection: {
    //     url: env.get('LIBSQL_URL'),
    //     authToken: env.get('LIBSQL_AUTH_TOKEN'),
    //   },
    //   useNullAsDefault: true,
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },
  },
})

export default dbConfig
