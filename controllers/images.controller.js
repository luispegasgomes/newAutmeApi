const db = require("../models/index.js");
const  Image = db.images;

exports.create = async (req, res) => {
    try {
        let repeated = await Image.findOne({ where: { name: req.body.name}})
        if (repeated != null)
        return res.status(422).json({
            success: false, msg: `The image ${req.body.name} already exists..`
        });
        // Save emotion in the database
        let newImage = await Image.create(req.body);
        res.status(201).json({ success: true, msg: "New image created.", URL: `/images/${newImage.name}` });
    }
    catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while creating the image."
            });
    };
};


exports.findAll = async (req, res) => {
    try {
        let images = await Image.findAll({
            attributes: ['correctAnswer', 'wrongAnswer', 'question', 'name', 'img', 'id']
        })
        res.status(200).json({
            success: true,
            images: images
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving all images."
        });
    };
};
