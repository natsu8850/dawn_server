const express = require('express');
const { StatusCodes } = require('http-status-codes');
const router = express.Router();
const pool = require('../../db');
const jwtGenerator = require('../utils/jwtGenerator');
const jwt = require('jsonwebtoken');


const bcrypt = require('bcrypt');
const verify = require('../middleware/verifyToken');


//REGISTER FACULTY
router.post('/register', async (req, res) => {
    const { first_name, last_name, id, email_personal, email_work, user_password, dob, level_lib, time_slot } = req.body;

    if (!first_name || !last_name || !id || !email_personal || !email_work || !user_password || !dob || !level_lib || !time_slot)
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Some feilds are missing" });

    try {
        const user = await pool.query("SELECT * FROM librarian where id = $1", [id]);
        const employee = await pool.query("SELECT * FROM employee where id = $1", [id]);

        if (user.rowCount !== 0) {
            res.status(StatusCodes.CONFLICT).json({ msg: "User already exists" })
        }

        if (employee.rowCount !== 0) {
            res.status(StatusCodes.CONFLICT).json({ msg: "User already exists" })
        }

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptedPassword = await bcrypt.hash(user_password, salt);

        const newEmployee = await pool.query(
            "INSERT INTO employee (first_name, last_name, id, email_personal, email_work, user_password, dob) VALUES($1, $2, $3, $4, $5, $6, $7)",
            [first_name, last_name, id, email_personal, email_work, bcryptedPassword, dob],
        );

        const newLibrarian = await pool.query(
            "INSERT INTO librarian (id, level_lib, time_slot) VALUES($1, $2, $3)",
            [id, level_lib, time_slot],
        );

        const token = jwt.sign({ id, email_work, isLibrarian: true }, process.env.JWT_SECRET, { expiresIn: "30d" })

        res.status(StatusCodes.OK).json({ msg: 'User has been created', token: token })
    }
    catch (error) {
        res.status(500).json({ msg: error });
    }
})

//LOGIN FACULTY
router.post('/login', async (req, res) => {
    try {
        const { id, user_password } = req.body;

        const faculty = await pool.query("SELECT * FROM librarian WHERE id = $1", [id]);

        if (faculty.rowCount === 0) {
            res.status(StatusCodes.BAD_REQUEST).json({ msg: "Librarian ID or password is incorrect" });
        }

        const employee = await pool.query("SELECT * FROM employee WHERE id = $1", [id]);

        if (employee.rowCount === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ msg: "Librarian ID or password is incorrect" })
        }

        const validPassword = bcrypt.compare(user_password, employee.rows[0].user_password);

        if (validPassword) {
            const token = jwt.sign({ id: employee.rows[0].id, email_work: employee.rows[0].email_work, isLibrarian: true }, process.env.JWT_SECRET, { expiresIn: "30d" })
            res.status(StatusCodes.OK).json({ isLibrarian: true, token: token })
        }

        res.json(faculty);
    } catch (error) {
        res.json({ msg: error.message });
    }
})

//DELETE A FACULTY
router.delete('/:id', verify, async (req, res, next) => {
    // res.status(403).json('You can only delete your account!')

    const userReqId = req.user.id;
    const { id } = req.params;

    if (userReqId === id) {
        try {
            const deleteFaculty = await pool.query("DELETE FROM librarian WHERE id = $1", [id])
            const deleteEmployee = await pool.query("DELETE FROM employee WHERE id = $1", [id])
            res.json({ msg: 'Librarian deleted from db' })
        }
        catch (error) {
            res.json({ msg: 'Something has gone wrong' })
            console.log(error);
        }
    }
    else {
        res.status(403).json('You can only delete your account!')
    }
});


//UPDATE A FACULTY
router.patch('/:id', verify, async (req, res, next) => {

    const userReqId = req.user.id;
    const { id } = req.params;

    if (userReqId === id) {
        try {
            const getFaculty = await pool.query("SELECT * FROM librarian WHERE id = $1", [id])

            if (getFaculty.rows[0].lenght === 0)
                res.status(StatusCodes.NOT_FOUND).json({ msg: "Librarian not found in database" })


            const getEmployee = await pool.query("SELECT * FROM employee WHERE id = $1", [id]);

            if (getEmployee.rows[0].lenght === 0)
                res.status(StatusCodes.NOT_FOUND).json({ msg: "Librarian not found in database" })
            res.json({ msg: 'Librarian deleted from db' })
        }
        catch (error) {
            res.json({ msg: 'Something has gone wrong' })
            console.log(error);
        }
    }
    else {
        res.status(403).json('You can only update your account!')
    }
});



//GET ALL FACULTIES
router.get('/', async (req, res) => {

    try {
        const faculty = await pool.query("SELECT * FROM librarian");

        res.status(200).json(faculty.rows);

    } catch (error) {
        console.log(error.message);
    }
});

//GET ONE LIBRARIAN

router.get('/find', async (req, res) => {
    const { id } = req.query;

    try {
        const faculty = await pool.query("SELECT * FROM librarian WHERE id = $1", [id]);

        if (faculty.rowCount === 0)
            res.status(404).json({ msg: "Unable to find employee, Enter ID correctly" });

        const employee = await pool.query("SELECT * FROM employee WHERE id = $1", [id]);

        if (employee.rowCount === 0)
            res.status(404).json({ msg: "Unable to find employee, Enter ID correctly" });

        //HOLD BACK PASSWORD IN RESPONSE
        const empDetails = employee.rows[0];

        const { user_password, ...info } = empDetails;

        res.status(200).json(info);

    } catch (error) {
        console.log(error.message);
    }
});



module.exports = router;