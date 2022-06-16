const express = require('express');
const authController = require("../controllers/auth.controller");
const usersController = require("../controllers/users.controller");
const diariesRouter = require("../routes/diaries.routes");
const notesRouter = require("../routes/notes.routes");
const appointmentsRouter = require("../routes/appointments.routes");
const bindingsRouter = require("../routes/bindings.routes");
let router = express.Router();
router.route('/')
    .get(authController.verifyToken, usersController.getAllUsers) //ADMIN ACCESS ONLY
    .post(usersController.create); //PUBLIC

router.route('/psychologists')
    .get(usersController.getAllPsychologists); //ADMIN or LOGGED USER ONLY
    
router.route('/login')
    .post(usersController.login); //PUBLIC

router.route('/:username')
    .get(authController.verifyToken, usersController.getUser) // LOGGED USER ONLY
    .patch(usersController.updatePhoto)
router.route('/psychologist/:username')
    .get(usersController.getPsychologist) // LOGGED USER ONLY

router.route('/password/:username')
    .patch(authController.verifyToken, usersController.updatePw);

router.route('/email/:username')
    .patch(usersController.updateEmail);

router.route('/:username/achievements/:idAchievement')
    .put(authController.verifyToken, usersController.addAchievement)
    .delete(authController.verifyToken, usersController.deleteAchievement)
    

router.use('/:username/diaries', diariesRouter)
router.use('/:username/notes', notesRouter)
router.use('/:username/appointments', appointmentsRouter)
router.use('/:username/bindings', bindingsRouter)

router.all('*', function (req, res) {
    res.status(404).json({
        message: 'USERS: what???'
    });

});
module.exports = router;