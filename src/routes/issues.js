const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { StatusCodes } = require('http-status-codes');
const verify = require('../middleware/verifyToken');
const CustomAPIError = require('../errors/custom-api');
const { default: axios } = require('axios');

//CREATE AN ISSUE
router.post('/', verify, async (req, res) => {
    const { acc_no, id, date_issued, due_date, returned } = req.body;

    if (!acc_no || !id || !date_issued || !due_date || !returned.toString()) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Some fields are missing" })
        return;
    }

    if (req.user.isLibrarian) {
        try {
            const idCheck = await pool.query("SELECT * FROM employee WHERE id = $1", [id]);
            const bookCheck = await pool.query("SELECT * FROM book WHERE acc_no = $1 AND copies = 1", [acc_no]);

            if (idCheck.rowCount === 0) {
                res.status(StatusCodes.NOT_FOUND).json({ msg: "Employee not found in the database" })
                return;
            }
            if (bookCheck.rowCount === 0) {
                res.status(StatusCodes.NOT_FOUND).json({ msg: "Book not found in database or is unavailable" })
                return;
            }

            const updateBook = await pool.query("UPDATE book SET copies = 0 WHERE acc_no = $1", [acc_no])


            const { data } = axios.patch('http://localhost:8800/books', {
                copies: 0,
            }, {
                headers: {
                    "content-type": "application/json",
                }
            })

            const newIssue = await pool.query("INSERT INTO issues (acc_no, id, date_issued, due_date, returned) VALUES($1, $2, $3, $4, $5) RETURNING *",
                [acc_no, id, date_issued, due_date, returned]
            );

            res.json(newIssue.rows[0]);
        }

        catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error })
        }
    }

    else {
        res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Only librarians can create an issue' })
    }

})

//GET ALL ISSUES
router.get('/', async (req, res) => {
    const { id } = req.query;
    if (id) {
        try {
            const allIssues = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
            res.json(allIssues.rows);
        } catch (error) {
            console.log(error.message);
        }
    }
    else {
        try {
            const allIssues = await pool.query("SELECT * FROM issues");
            res.json(allIssues.rows);
        } catch (error) {
            console.log(error.message);
        }
    }
})

//GET SINGLE ISSUE
router.get("/find", async (req, res) => {

    const { acc_no, id } = req.query;

    if (!acc_no && !id) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "You have to supply either an acc_no or employee id" });
        return;
    }

    try {
        if (acc_no && !id) {
            const issue = await pool.query("SELECT * FROM issues WHERE acc_no = $1", [acc_no]);
            if (issue.rowCount === 0) {
                res.status(404).json({ msg: "No data found" })
            }
            res.status(200).json(issue.rows[0])
            return;
        }
        else if (!acc_no && id) {
            const issue = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
            if (issue.rowCount === 0) {
                res.status(404).json({ msg: "No data found" })
            }
            res.status(200).json(issue.rows[0])
            return;
        }
        else {
            const issue = await pool.query("SELECT * FROM issues WHERE id = $1 AND acc_no = $2", [id, acc_no]);
            if (issue.rowCount === 0) {
                res.status(404).json({ msg: "No data found" })
            }
            res.status(200).json(issue.rows)
            return;
        }
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }

})


//UPDATE SINGLE ISSUE

router.patch('/', async (req, res) => {

    const { acc_no, id } = req.query;

    const { returned } = req.body;

    if (!acc_no || !returned || !id) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Some fields are missing" })
    }

    try {

        const old_data_fetch = await pool.query("SELECT * FROM issues WHERE id = $1 AND acc_no = $2", [id, acc_no]);

        const old_data = old_data_fetch.rows[0];

        const updateBook = await pool.query("UPDATE issues SET acc_no = $1, id = $2, date_issued = $3, due_date = $4, returned = $5 WHERE id = $6 AND acc_no = $7", [acc_no, id, old_data.date_issued, old_data.due_date, returned, id, acc_no])

        res.json({ msg: 'Updated the book' });
    } catch (error) {
        console.log(error.message);
    }
})

router.delete('/', async (req, res) => {

    const { acc_no, id } = req.query;

    if (!acc_no || !id) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Some fields are missing" });
        return;
    }

    try {
        const deleteIssue = await pool.query("DELETE FROM issues WHERE acc_no = $1 AND id = $2", [acc_no, id])
        res.json({ msg: `Deleted the issue` });
    } catch (error) {
        console.log(error.message);
    }
})


module.exports = router;