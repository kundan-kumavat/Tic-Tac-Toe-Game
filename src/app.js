const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json({
    limit: "16kb",
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.static('public'));
app.use(express.urlencoded({
    extended: true,
    limit: '16kb',
}));

const userRouter = require('./routes/user.routes.js');
const gameRouter = require('./routes/game.routes.js');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/game', gameRouter);

module.exports = {app};