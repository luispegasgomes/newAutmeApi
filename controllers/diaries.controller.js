const db = require("../models/index.js");
const User = db.user;
const Diary = db.diary;

exports.create = async (req, res) => {
    try {

        if (!req.body || !req.body.title)
            return res.status(400).json({
                success: false,
                msg: "Must provide title and the corresponding user."
            });
        // try to find the user, given its username
        let user = await User.findByPk(req.params.username)

        if (user === null)
            return res.status(404).json({
                success: false,
                msg: `Cannot find any user ${req.params.username}.`
            });
        // save diary in the database
        let newDiary = await Diary.create({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            allUserUsername: req.params.username
        });

        // add diary to found username (using a mixin)
        await user.addDiary(newDiary);

        res.status(201).json({
            success: true,
            msg: `Diary added to user with username ${req.params.username}.`,
            URL: `/users/${req.params.username}/diaries/${newDiary.id}`,
            ID: newDiary.id,
        });
    } catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            res.status(400).json({
                success: false,
                msg: err.errors.map(e => e.message)
            });
        else
            res.status(500).json({
                success: false,
                msg: err.message || "Some error occurred while creating the diary."
            });
    };
}


exports.findAll = async (req, res) => {
    try {
        if (req.loggedUserRole != "child")
        return res.status(403).json({
            success: false,
            msg: "You do not have permission to access this request."
        });
        // try to find the user, given its ID
        let user = await User.findByPk(req.params.username, {
            //include: Note
            include: [{
                model: Diary,
                attributes: ['id', 'title', 'description', 'date']
            }]
        })

        if (user === null)
            return res.status(404).json({
                success: false,
                msg: `Cannot find the user ${req.params.username}.`
            });

        res.status(200).json({
            success: true,
            user: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving the user."
        })
    }
}

exports.delete = async (req, res) => {
    try {
        let user = await User.findByPk(req.params.username)
        if (user === null)
            return res.status(404).json({
                success: false,
                msg: `Cannot find any user with username ${req.params.username}.`
            });

        if (req.loggedUserRole != "child" && req.loggedUserUsername != req.params.username)
            return res.status(403).json({
                success: false,
                msg: "This request requires ADMIN role or the user authenticated!"
            });

        let diary = await Diary.findByPk(req.params.idDiary)
        if (diary === null)
            return res.status(404).json({
                success: false,
                msg: `Cannot find any diary with ID ${req.params.idDiary}.`
            });

        let results = await user.hasDiary(diary);
        if (!results)
            return res.status(400).json({
                success: false,
                msg: `User with username ${req.params.username} does no have diary with ID ${req.params.idDiary}.`
            });

        let result = await Diary.destroy({
            where: {
                id: req.params.idDiary
            }
        })
        // console.log(result)

        if (result == 1) // the promise returns the number of deleted rows
            return res.status(200).json({
                success: true,
                msg: `Diary with id ${req.params.idDiary} was successfully deleted!`
            });
        // no rows deleted -> no user was found
        res.status(404).json({
            success: false,
            msg: `Cannot find any diary with ID ${req.params.idDiary}.`
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            msg: `Error deleting diary with ID ${req.params.idDiary}.`
        });
    };
};

exports.update = async (req, res) => {
    try {
        // since Sequelize update() does not distinguish if a user exists, first let's try to find one
        let user = await User.findByPk(req.params.username);
        if (user === null)
            return res.status(404).json({
                success: false,
                msg: `Cannot find any user with username ${req.params.username}.`
            });
        if (req.loggedUserRole != "child" || req.params.username != req.loggedUserUsername)
            return res.status(403).json({
                success: false,
                msg: "This request requires CHILD role or the user authenticated!"
            });
            console.log(req.loggedUserUsername);
        let diary = await Diary.findByPk(req.params.idDiary)
        if (diary === null)
            return res.status(404).json({
                success: false,
                msg: `Cannot find any diary with ID ${req.params.idDiary}.`
            });

        if (!req.body.title) {
            return res.status(404).json({
                success: false,
                msg: `No title found.`
            });
        }
        // obtains only a single entry from the table, using the provided primary key
        let affectedRows = await Diary.update({
            title: req.body.title
        }, {
            where: {
                id: req.params.idDiary
            }
        })
        console.log(affectedRows)
        if (affectedRows[0] === 0) // check if the user was updated (returns [0] if no data was updated)
            return res.status(200).json({
                success: true,
                msg: `No updates were made on diary with ID ${req.params.idDiary}.`
            });

        res.json({
            success: true,
            msg: `Diary with ID ${req.params.idDiary} was updated successfully.`
        });
    } catch (err) {
        if (err instanceof ValidationError)
            return res.status(400).json({
                success: false,
                msg: err.errors.map(e => e.message)
            });
        res.status(500).json({
            success: false,
            msg: `Error retrieving diary with ID ${req.params.idDiary}.`
        });
    };
};