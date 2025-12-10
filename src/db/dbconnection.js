require('../loadEnv');
require('dotenv').config();
const {Pool} = require('pg');
const fs = require('node:fs');
const path = require('node:path');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem'), 'utf8')
    } : false
});

module.exports = pool;
