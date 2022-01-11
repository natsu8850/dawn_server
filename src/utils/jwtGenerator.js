const jwt = require('jsonwebtoken');
require('dotenv').config();


function jwtGenerator({ id, dept_id, work_email }) {
    const payload = {
        id,
        dept_id,
        work_email
    }

    console.log(payload);

    const sign = jwt.sign(payload, 'dumbdawn', { expiresIn: "30d" })

    return sign;
}

module.exports = jwtGenerator;