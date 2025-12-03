import db from '../lib/db'

console.log('Database initialized successfully!')
console.log('Location:', db.name)

// Close the database connection
db.close()
console.log('Database connection closed.')


