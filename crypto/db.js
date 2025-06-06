const mysql = require('mysql2/promise')
require('dotenv').config()

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(
      ', '
    )}. Exiting.`
  )
  process.exit(1)
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306, // Thêm port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Test connection on startup
;(async () => {
  try {
    const connection = await pool.getConnection()
    console.log('Successfully connected to the database.')
    connection.release()
  } catch (error) {
    console.error(`Failed to connect to the database: ${error.message}`)
    process.exit(1)
  }
})()

module.exports = pool
