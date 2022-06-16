const db = require("../models/index.js");
const Emotions = db.emotions;

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
    const emotions = data.rows;
    const currentPage = page;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, emotions, totalPages, currentPage };
};

// Display list of all emotions (with pagination)
exports.getAllEmotions = async (req, res) => {
    try {
        // do not expose users' sensitive data
        let emotions = await Emotions.findAll({
            attributes: ['name', 'img', 'hint']
        })
        res.status(200).json({
            success: true,
            emotions: emotions
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving all emotions."
        });
    };
};

// List just one username
exports.findOne = async (req, res) => {
    try {
        // obtains only a single entry from the table, using the provided primary key
        let emotion = await Emotions.findOne({ where: { name: req.params.name } });
        
        if (emotion === null)
            res.status(404).json({
                success: false, msg: `Cannot find any emotion with name ${req.params.name}.`
            });
        else
            res.json({ success: true, emotion: emotion });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving emotion with name ${req.params.name}.`
        });
    };
};

// Handle emotion create on POST
exports.create = async (req, res) => {
    try {
        let repeated = await Emotions.findOne({ where: { name: req.body.name}})
        if (repeated != null)
        return res.status(422).json({
            success: false, msg: `The emotion ${req.body.name} already exists..`
        });

        // Save emotion in the database
        let newEmotion = await Emotions.create(req.body);
        res.status(201).json({ success: true, msg: "New emotion created.", URL: `/emotions/${newEmotion.name}` });
    }
    catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while creating the emotion."
            });
    };
};

exports.update = async (req, res) => {
    try {
        // since Sequelize update() does not distinguish if a tutorial exists, first let's try to find one
        let emotion = await Emotions.findOne({ where: { name: req.params.name } });
        if (emotion === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any emotion with name ${req.params.name}.`
            });

        // obtains only a single entry from the table, using the provided primary key
        let affectedRows = await Emotions.update(req.body, { where: { name: req.params.name } })

        if (affectedRows[0] === 0) // check if the children was updated (returns [0] if no data was updated)
            return res.status(200).json({
                success: true, msg: `No updates were made on emotion with name ${req.params.name}.`
            });

        res.json({
            success: true,
            msg: `Emotion ${req.params.name} was updated successfully.`
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            return res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        res.status(500).json({
            success: false, msg: `Error retrieving child with username ${req.params.username}.`
        });
    };
};

exports.delete = async (req, res) => {
    try {
        let result = await Emotions.destroy({ where: { name: req.params.name } })
        if (result == 1) 
            return res.status(200).json({
                success: true, msg: `Emotion ${req.params.name} was successfully deleted!`
            });
        res.status(404).json({
            success: false, msg: `Cannot find any emotion with name ${req.params.name}.`
        });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            success: false, msg: `Error deleting emotion with name ${req.params.name}.`
        });
    };
};

