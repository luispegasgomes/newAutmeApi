const db = require("../models/index.js");
const Achievement = db.achievement;

//necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');

// function to map default response to desired response data structure
// {
//     "totalItems": 8,
//     "childs": [...],
//     "totalPages": 3,
//     "currentPage": 1
// }
const getPagingData = (data, page, limit) => {
    // data Sequelize Model method findAndCountAll function has the form
    // {
    //     count: 5,
    //     rows: [
    //              tutorial {...}
    //         ]
    // }
    const totalItems = data.count;
    const achievements = data.rows;
    const currentPage = page;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, achievements, totalPages, currentPage };
};

// Display list of all achievements

exports.findAll = async (req, res) => {
    try {
        // do not expose users' sensitive data
        let achievements = await Achievement.findAll({
            attributes: ['id', 'name', 'description', 'imgUrl']
        })
        res.status(200).json({
            success: true,
            achievements: achievements
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving all achievements."
        });
    };
};



// Handle tutorial create on POST
exports.create = async (req, res) => {
    try {
        // Save Tutorial in the database
        let newAchievement = await Achievement.create(req.body);
        res.status(201).json({ success: true, msg: "New achievement created.", URL: `/achievements/${newAchievement.id}` });
    }
    catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while creating the new achievement."
            });
    };
};