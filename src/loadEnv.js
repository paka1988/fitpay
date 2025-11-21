const path = require('path');
const dotenv = require('dotenv');

const envFile = `.env.${process.env.NODE_ENV}`;

dotenv.config({
    path: path.resolve(process.cwd(), envFile)
});

console.log(`Environment loaded from ${envFile}`);
