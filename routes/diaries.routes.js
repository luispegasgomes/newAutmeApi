const express = require('express');
const authController = require("../controllers/auth.controller");
const diariesController = require("../controllers/diaries.controller");


// express router
let router = express.Router({ mergeParams: true });

router.route('/')
    .get(authController.verifyToken, diariesController.findAll)
    .post(authController.verifyToken, diariesController.create);

//needs to be BEFORE route /:tutorialID (otherwise, "published" string will be treated as an ID)
router.route('/:idDiary')
    .patch(authController.verifyToken, diariesController.update)
    .delete(authController.verifyToken, diariesController.delete)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'DIARIES: what???' });
})

module.exports = router;    