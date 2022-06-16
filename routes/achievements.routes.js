const express = require('express');

const achievementsController = require("../controllers/achievements.controller");

// express router
let router = express.Router();

router.use((req, res, next) => {
    const start = Date.now();
    //compare a start time to an end time and figure out how many seconds elapsed
    res.on("finish", () => { // the finish event is emitted once the response has been sent to the client
        const end = Date.now();
        const diffSeconds = (Date.now() - start) / 1000;
        console.log(`${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})

    
router.route('/')
    .get(achievementsController.findAll)
    .post(achievementsController.create);


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({
        message: 'ACHIVEMENTS: what???'
    });
})

module.exports = router;