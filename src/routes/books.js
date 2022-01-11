const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { StatusCodes } = require('http-status-codes');
const verify = require('../middleware/verifyToken');

//CREATE A BOOK
router.post('/', verify, async (req, res) => {
    const { acc_no, ref_no, title, pub_year, edition_name, author } = req.body;

    if (!acc_no || !ref_no || !title || !pub_year || !edition_name || !author) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Some fields are missing" })
        return;
    }

    if (req.user.isLibrarian) {
        try {
            const bookCheck = await pool.query("SELECT * FROM book WHERE acc_no = $1", [acc_no]);

            if (bookCheck.rowCount !== 0) {
                res.status(StatusCodes.CONFLICT).json({ msg: "Duplicate accession number" })
                return;
            }

            const newBook = await pool.query("INSERT INTO book (acc_no, ref_no, title, pub_year, edition_name) VALUES($1, $2, $3, $4, $5) RETURNING *",
                [acc_no, ref_no, title, pub_year, edition_name]
            );
            const newAuthor = await pool.query("INSERT INTO author (acc_no, author) VALUES($1, $2) RETURNING *",
                [acc_no, author]
            );
            res.json(newBook.rows[0]);

        } catch (error) {
            if (error.message.includes('duplicate')) {
                res.status(StatusCodes.CONFLICT).json({ msg: 'Duplicate accession number' })
            }
        }
    }
    else {
        res.status(StatusCodes.UNAUTHORIZED).json({ msg: "You are not authenticated" })
    }
})

//GET ALL BOOKS
router.get('/', async (req, res) => {
    try {
        const allBooks = await pool.query("SELECT * FROM book");
        res.json(allBooks.rows);
    } catch (error) {
        res.send(error);
        console.log(error.message);
    }
})

//GET SINGLE BOOK
router.get("/find", async (req, res) => {

    const { id } = req.query;

    try {
        const allBooks = await pool.query("SELECT * FROM book WHERE acc_no = $1", [id]);

        if (allBooks.rows.length > 0)
            res.json(allBooks.rows[0]);
        else
            res.status(404).json({ msg: "Unable to find book with this acc no" })
    } catch (error) {
        console.log(error.message);
    }
})

router.get('/search', async (req, res) => {
    const { title } = req.query;
    if (!title) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Title is required to perform search" })
        return;
    }

    try {
        const allSearchBooks = await pool.query(`SELECT * FROM book WHERE title ILIKE '%${title}%'`);
        if (allSearchBooks.rows.length > 0)
            res.status(200).json(allSearchBooks.rows);
        else
            res.status(404).json({ msg: "Unable to find book with this acc no" })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: error.message })
    }

})


//UPDATE SINGLE BOOK

router.patch('/', async (req, res) => {
    try {
        const { id } = req.query;
        let { acc_no, ref_no, title, pub_year, edition_name, copies } = req.body;

        const old_data_fetch = await pool.query("SELECT * FROM book WHERE acc_no = $1", [id]);

        const old_data = old_data_fetch.rows[0];

        if (!acc_no) {
            acc_no = old_data.acc_no;
        }

        if (!title) {
            title = old_data.title;
        }

        if (!pub_year) {
            pub_year = old_data.pub_year;
        }

        if (!edition_name) {
            edition_name = old_data.edition_name;
        }

        if (!copies) {
            copies = old_data.copies;
        }

        const updateBook = await pool.query("UPDATE book SET acc_no = $1, ref_no = $2, title = $3, pub_year = $4, edition_name = $5, copies = $6 WHERE acc_no = $7", [acc_no, ref_no, title, pub_year, edition_name, copies, id])

        res.json({ msg: 'Updated the book' });
    } catch (error) {
        console.log(error.message);
    }
})


//DELETE SINGLE BOOK

router.delete('/', async (req, res) => {
    try {
        const { id } = req.query;
        const deleteBook = await pool.query("DELETE FROM book WHERE acc_no = $1", [id])
        res.json({ msg: `Deleted the book with accession number ${id}` });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
})


//author

router.get("/author", async (req, res) => {

    const { acc_no } = req.query;

    try {
        const author = await pool.query("SELECT * FROM author WHERE acc_no = $1", [acc_no]);

        if (author.rows.length > 0)
            res.json(author.rows[0]);
        else
            res.status(404).json({ msg: "Unable to find author" })
    } catch (error) {
        res.status(500).json({ msg: 'Something went wrong' })
        console.log(error.message);
    }
})


module.exports = router;