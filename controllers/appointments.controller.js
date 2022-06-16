const db = require("../models/index.js");
const User = db.user; const Appointment = db.appointment;

exports.create = async (req, res) => {
    try {
        if (req.loggedUserRole == "child")
        return res.status(403).json({
            success: false,
            msg: "You do not have permission to access this request."
        });
        // try to find the user, given its username
        let user = await User.findByPk(req.params.username)

        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user ${req.params.username}.`
            });
        // save appointment in the database
        let newAppointment = await Appointment.create(req.body);

        // add Appointment to found username (using a mixin)
        await user.addAppointment(newAppointment);

        res.status(201).json({
            success: true, msg: `Appointment added to user with username ${req.params.username}.`,
            URL: `/users/${req.params.username}/appointments/${newAppointment.id}`
        });
    } catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while creating the Appointment."
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
            //include: appointment
            include: [{
                model: Appointment,
                attributes: ['id', 'allUserUsername', 'psychologist', 'date', 'time', 'city', 'avatar']
            }]
        })

        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find the user ${req.params.username}.`
            });

        res.status(200).json({
            success: true, user: user
        });
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving the user."
        })
    }
}

exports.delete = async (req, res) => {
    try {
        if (req.loggedUserRole == "child")
        return res.status(403).json({
            success: false,
            msg: "You do not have permission to access this request."
        });
        let user = await User.findByPk(req.params.username)
        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with username ${req.params.username}.`
            });

        let appointment = await Appointment.findByPk(req.params.idAppointment)
        if (appointment === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any appointment with ID ${req.params.idAppointment}.`
            });

        let results = await user.hasAppointment(appointment);
        if (!results)
            return res.status(400).json({
                success: false, msg: `User with username ${req.params.username} does no have appointment with ID ${req.params.idAppointment}.`
            });

        let result = await Appointment.destroy({ where: { id: req.params.idAppointment } })
        // console.log(result)

        if (result == 1) // the promise returns the number of deleted rows
            return res.status(200).json({
                success: true, msg: `Appointment with id ${req.params.idAppointment} was successfully deleted!`
            });
        // no rows deleted -> no user was found
        res.status(404).json({
            success: false, msg: `Cannot find any appointment with ID ${req.params.idAppointment}.`
        });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            success: false, msg: `Error deleting appointment with ID ${req.params.idAppointment}.`
        });
    };
};

exports.update = async (req, res) => {
    try {
        // since Sequelize update() does not distinguish if a user exists, first let's try to find one
        let user = await User.findByPk(req.params.username);
        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with username ${req.params.username}.`
            });

        let appointment = await Appointment.findByPk(req.params.idAppointment)
        if (appointment === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any appointment with ID ${req.params.idAppointment}.`
            });

        if (!req.body.title) {
            return res.status(404).json({
                success: false, msg: `No title found.`
            });
        }
        // obtains only a single entry from the table, using the provided primary key
        let affectedRows = await Appointment.update({ title: req.body.title }, { where: { id: req.params.idAppointment } })
        console.log(affectedRows)
        if (affectedRows[0] === 0) // check if the user was updated (returns [0] if no data was updated)
            return res.status(200).json({
                success: true, msg: `No updates were made on appointment with ID ${req.params.idAppointment}.`
            });

        res.json({
            success: true,
            msg: `Appointment with ID ${req.params.idAppointment} was updated successfully.`
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            return res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        res.status(500).json({
            success: false, msg: `Error retrieving appointment with ID ${req.params.idAppointment}.`
        });
    };
};
