const db = require("../models/index.js");
const User = db.user;
const Note = db.note;

exports.create = async (req, res) => {
    try {
        // try to find the user, given its username
        /*if (req.loggedUserRole != "psychologist")
        return res.status(403).json({
            success: false,
            msg: "This request requires psychologist role!"
        });*/
        let user = await User.findByPk(req.params.username)

        if (user === null)
            return res.status(404).json({
                success: false,
                msg: `Cannot find any user ${req.params.username}.`
            });
        if (!req.body || !req.body.title)
            return res.status(400).json({
                success: false,
                msg: "Must provide title."
            });

        // save note in the database
        let newNote = await Note.create(req.body);

        // add note to found username (using a mixin)
        await user.addNote(newNote);

        res.status(201).json({
            success: true,
            msg: `Note added to user with username ${req.params.username}.`,
            URL: `/users/${req.params.username}/notes/${newNote.id}`
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
                msg: err.message || "Some error occurred while creating the note."
            });
    };
}

exports.findAll = async (req, res) => {
    try {
        if (req.loggedUserRole == "child")
        return res.status(403).json({
            success: false,
            msg: "You do not have permission to access this request."
        });
        // try to find the user, given its ID
        let user = await User.findByPk(req.params.username, {
            //include: Note
            include: [{
                model: Note,
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

