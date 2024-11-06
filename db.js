const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("./notes.db")

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    content TEXT,
    opened_at DATE DEFAULT NULL,
    created_at DATE DEFAULT (datetime('now', 'localtime'))
  )`)
})

const saveNote = (id, content) =>
  new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO notes (id, content) VALUES (?, ?)`,
      [id, content],
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })

/**
 * Retrieves a note from the database by its unique identifier.
 *
 * This function returns a Promise that resolves with the note object, or rejects with an error if the note could not be retrieved.
 *
 * @param {string} id - The unique identifier of the note to retrieve.
 * @returns {Promise<object>} A Promise that resolves with the note object.
 */
const getNote = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM notes WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

/**
 * Updates the `opened_at` timestamp for the note with the given `id` to the current time.
 *
 * This function returns a Promise that resolves when the update is complete.
 *
 * @param {string} id - The unique identifier of the note to mark as opened.
 * @returns {Promise} A Promise that resolves when the note has been marked as opened.
 */
const markNoteAsOpened = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE notes SET opened_at = datetime('now', 'localtime') WHERE id = ?`,
      [id],
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

/**
 * Deletes expired notes from the database.
 *
 * Notes are considered expired if:
 * - They have been opened more than 5 minutes ago
 * - They have not been opened and were created more than 7 days ago
 *
 * This function returns a Promise that resolves when the deletion is complete.
 */
const deleteExpiredNotes = () => {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM notes WHERE opened_at IS NOT NULL AND opened_at < datetime('now', localtime ,'-5 minutes')
      OR opened_at is NULL AND created_at < datetime('now', localtime ,'-7 days')`,
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

module.exports = {
  saveNote,
}
