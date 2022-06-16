const express = require('express');

const appointmentsController = require("../controllers/appointments.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router({ mergeParams: true });

router.route('/')
    .get(appointmentsController.findAll)
    .post(appointmentsController.create);

//needs to be BEFORE route /:tutorialID (otherwise, "published" string will be treated as an ID)
router.route('/:idAppointment')
    .patch(appointmentsController.update)
    .delete(authController.verifyToken, appointmentsController.delete)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'APPOINTMENTS: what???' });
})

module.exports = router;    