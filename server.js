const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS userinformation (
        username TEXT PRIMARY KEY,
        password TEXT,
        title TEXT,
        favoritepasswordkey TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS TrackingRecord (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    Date TEXT,
    Company TEXT,
    URL TEXT,
    JobTitle TEXT,
    JobDescription TEXT,
    JobRequirement TEXT,
    AppliedStatus TEXT,
    Responsestatus TEXT
)`);

});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});


app.get('/records/:username', (req, res) => {
    const username = req.params.username;

    db.all(
        `SELECT * FROM TrackingRecord WHERE username=? ORDER BY Date ASC`,
        [username],
        (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json([]);
            }
            res.json(rows);
        }
    );
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM userinformation WHERE username=? AND password=?`,
        [username, password],
        (err, row) => res.json({ success: !!row })
    );
});

app.post('/add-record', (req, res) => {
    const r = req.body;

    db.run(`
        INSERT INTO TrackingRecord 
        (username, Date,Company,URL, JobTitle, JobDescription, JobRequirement,AppliedStatus,Responsestatus)
        VALUES (?, ?, ?, ?, ?,?,?,?,?)
    `,
    [r.username, r.Date, r.Company,r.URL,r.JobTitle, r.JobDescription,r.JobRequirement, r.AppliedStatus, r.Responsestatus],
    () => res.json({ success: true })
    );
});

app.post('/reset-password', (req, res) => {
    const { username, key } = req.body;
    db.get(`SELECT * FROM userinformation WHERE username=? AND favoritepasswordkey=?`,
        [username, key],
        (err, row) => {
            if (row) {
                db.run(`UPDATE userinformation SET password='password' WHERE username=?`, [username]);
                res.json({ success: true });
            } else res.json({ success: false });
        });
});


app.get('/records', (req, res) => {
    db.all(`SELECT * FROM TrackingRecord`, (err, rows) => res.json(rows));
});

app.post('/delete-record', (req, res) => {
    db.run(`DELETE FROM TrackingRecord WHERE id=?`, [req.body.id],
        () => res.json({ success: true })
    );
});

app.post('/update-user', (req, res) => {
    const { username, password, title, key } = req.body;
    db.run(`INSERT OR REPLACE INTO userinformation VALUES (?,?,?,?)`,
        [username, password, title, key],
        () => res.json({ success: true })
    );
});

app.get('/user/:username', (req, res) => {
    const username = req.params.username;

    db.get(
        `SELECT * FROM userinformation WHERE username=?`,
        [username],
        (err, row) => {
            if (err) {
                console.log(err);
                return res.status(500).json(null);
            }

            res.json(row); // returns user info
        }
    );
});
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
