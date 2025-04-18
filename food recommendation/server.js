const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS votes (choice TEXT PRIMARY KEY, count INTEGER)");
  ['breakfast', 'lunch', 'dinner'].forEach(option => {
    db.run("INSERT OR IGNORE INTO votes (choice, count) VALUES (?, 0)", [option]);
  });
});

app.post('/vote', (req, res) => {
  const choice = req.body.vote;
  db.run("UPDATE votes SET count = count + 1 WHERE choice = ?", [choice], err => {
    if (err) return res.status(500).send("Database error");
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
  });
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
