const express = require('express')
const app = express();
const notFoundMiddleware = require('./src/middleware/not-found');
const errorHandlerMiddleware = require('./src/middleware/error-handler');
const cors = require('cors');
require('dotenv').config();

const booksRoute = require('./src/routes/books');
const facultyRoute = require('./src/routes/faculty');
const issuesRoute = require('./src/routes/issues');
const librarianRoute = require('./src/routes/librarian');

const port = 8800;

app.use(cors());
app.use(express.json());


//ROUTES

//BOOK
app.use('/books', booksRoute);
//USER
app.use('/faculty', facultyRoute);

//LIBRARIAN
app.use('/librarian', librarianRoute)

//ISSUES
app.use('/issues', issuesRoute)

app.use('/hello', (req, res) => {
    res.json('hi')
})

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`)
);