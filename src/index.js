const dotenv = require('dotenv');
const {app} = require('./app.js');
const connectDB = require('./db/index.js');

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB()
.then(() => {
    app.listen(PORT, ()=> {
        console.log(`Server started at port: ${PORT}`)
    });
})
.catch((error) => {
    console.log('MongoDB connection failed ', error);
});

app.get('/', (req, res) => {
    res.send('Tic Tac Toe game backend API by Kundan')
});