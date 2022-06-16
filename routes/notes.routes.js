const express = require('express');

const notesController = require("../controllers/notes.controller");


// express router
let router = express.Router({ mergeParams: true });

router.route('/')
    .get(notesController.findAll)
    .post(notesController.create);

//needs to be BEFORE route /:tutorialID (otherwise, "published" string will be treated as an ID)
router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'NOTES: what???' });
})

module.exports = router;    
