import Database from "better-sqlite3";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, "qwencliui_auth.db");
const INIT_SQL_PATH = path.join(__dirname, "init.sql");

// Create database connection
const db = new Database(process.env.DB_PATH || DB_PATH);
// console.log('Connected to SQLite database');

// Initialize database with schema
const initializeDatabase = async () => {
  try {
    const initSQL = fs.readFileSync(INIT_SQL_PATH, "utf8");
    db.exec(initSQL);
    // console.log('Database initialized successfully');
  } catch (error) {
    // console.error('Error initializing database:', error.message);
    throw error;
  }
};

// User database operations
const userDb = {
  // Check if any users exist
  hasUsers: () => {
    try {
      const row = db
        .prepare("SELECT COUNT(*) as count FROM qwencliui_users")
        .get();
      return row.count > 0;
    } catch (err) {
      throw err;
    }
  },

  // Create a new user
  createUser: (username, passwordHash) => {
    try {
      const stmt = db.prepare(
        "INSERT INTO qwencliui_users (username, password_hash) VALUES (?, ?)"
      );
      const result = stmt.run(username, passwordHash);
      return { id: result.lastInsertRowid, username };
    } catch (err) {
      throw err;
    }
  },

  // Get user by username
  getUserByUsername: (username) => {
    try {
      const row = db
        .prepare(
          "SELECT * FROM qwencliui_users WHERE username = ? AND is_active = 1"
        )
        .get(username);
      return row;
    } catch (err) {
      throw err;
    }
  },

  // Update last login time
  updateLastLogin: (userId) => {
    try {
      db.prepare(
        "UPDATE qwencliui_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(userId);
    } catch (err) {
      throw err;
    }
  },

  // Get user by ID
  getUserById: (userId) => {
    try {
      const row = db
        .prepare(
          "SELECT id, username, created_at, last_login FROM qwencliui_users WHERE id = ? AND is_active = 1"
        )
        .get(userId);
      return row;
    } catch (err) {
      throw err;
    }
  },
};

export { db, initializeDatabase, userDb };
