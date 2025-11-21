const pool = require('./dbconnection');
const fs = require('fs');
const path = require('path');

(async () => {
    const sql = fs.readFileSync(path.join(__dirname, 'setup.sql')).toString();
    try {
        await pool.query(sql);
        console.log("Database initialized ✔️");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
