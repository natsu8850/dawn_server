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
    try {
        const { first_name, last_name, id, email_personal, email_work, user_password, dob, dept_id } = req.body;
        const user = await pool.query("SELECT * FROM faculty where id = $1", [id]);

        if (user.rowCount !== 0) {
            res.status(StatusCodes.CONFLICT).json({ msg: "User already exists" })
        }

        else {
            const saltRound = 10;
            const salt = await bcrypt.genSalt(saltRound);
            const bcryptedPassword = await bcrypt.hash(user_password, salt);

            const newEmployee = await pool.query(
                "INSERT INTO employee (first_name, last_name, id, email_personal, email_work, user_password, dob) VALUES($1, $2, $3, $4, $5, $6, $7)",
                [first_name, last_name, id, email_personal, email_work, bcryptedPassword, dob],
            );

            const newFaculty = await pool.query(
                "INSERT INTO faculty (id, dept_id) VALUES($1, $2)",
                [id, dept_id],
            );

            const token = jwt.sign({ id, dept_id, email_work, isLibrarian: false }, process.env.JWT_SECRET, { expiresIn: "30d" })

            res.status(StatusCodes.OK).json({ msg: 'User has been created', token: token })
        }
    }
    catch (error) {
        res.status(500).json({ msg: "Something has gone wrong" });
    }
})

//LOGIN FACULTY
router.post('/login', async (req, res) => {
    try {
        const { id, user_password } = req.body;

        const faculty = await pool.query("SELECT * FROM faculty WHERE id = $1", [id]);

        if (faculty.rowCount === 0) {
            res.status(StatusCodes.BAD_REQUEST).json({ msg: "Faculty ID or password is incorrect" });
        }

        const employee = await pool.query("SELECT * FROM employee WHERE id = $1", [id]);

        if (employee.rowCount === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ msg: "Faculty ID or password is incorrect" })
        }

        const validPassword = bcrypt.compare(user_password, employee.rows[0].user_password);

        if (validPassword) {
            const token = jwt.sign({ id: employee.rows[0].id, dept_id: faculty.rows[0].dept_id, email_work: employee.rows[0].email_work, isLibrarian: false }, process.env.JWT_SECRET, { expiresIn: "30d" })
            res.status(StatusCodes.OK).json({ isLibrarian: false, token: token })
        }

        res.json(faculty);
    } catch (error) {

    }
})

//DELETE A FACULTY
router.delete('/:id', verify, async (req, res, next) => {
    // res.status(403).json('You can only delete your account!')

    const userReqId = req.user.id;
    const { id } = req.params;


    if (userReqId === id) {
        try {
            const deleteFaculty = await pool.query("DELETE FROM faculty WHERE id = $1", [id])
            const deleteEmployee = await pool.query("DELETE FROM employee WHERE id = $1", [id])
            res.json({ msg: 'Faculty deleted from db' })
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
            const getFaculty = await pool.query("SELECT * FROM faculty WHERE id = $1", [id])

            if (getFaculty.rows[0].lenght === 0)
                res.status(StatusCodes.NOT_FOUND).json({ msg: "Faculty not found in database" })


            const getEmployee = await pool.query("SELECT * FROM employee WHERE id = $1", [id]);

            if (getEmployee.rows[0].lenght === 0)
                res.status(StatusCodes.NOT_FOUND).json({ msg: "Faculty not found in database" })
            res.json({ msg: 'Faculty deleted from db' })
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
        const faculty = await pool.query("SELECT * FROM faculty");

        res.status(200).json(faculty.rows);

    } catch (error) {
        console.log(error.message);
    }
});

//GET ONE FACULTY

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const faculty = await pool.query("SELECT * FROM faculty WHERE id = $1", [id]);

        if (faculty.rows.length === 0)
            res.status(404).json({ msg: "Unable to find employee with, Enter ID correctly" });

        const employee = await pool.query("SELECT * FROM employee WHERE id = $1", [id]);

        if (employee.rows.length === 0)
            res.status(404).json({ msg: "Unable to find employee with, Enter ID correctly" });

        //HOLD BACK PASSWORD IN RESPONSE
        const empDetails = employee.rows[0];

        const { user_password, ...info } = empDetails;

        res.status(200).json(info);

    } catch (error) {
        console.log(error.message);
    }
});



module.exports = router;