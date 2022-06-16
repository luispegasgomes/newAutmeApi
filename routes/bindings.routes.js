const express = require('express');

const bindingsController = require("../controllers/bindings.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router({ mergeParams: true });

router.route('/')
    .get(authController.verifyToken, bindingsController.findAll)
router.route('/:child')
    .post(authController.verifyToken, bindingsController.create)
    .delete(authController.verifyToken, bindingsController.delete);

//needs to be BEFORE route /:tutorialID (otherwise, "published" string will be treated as an ID)



router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'BINDINGS: what???' });
})

module.exports = router;    