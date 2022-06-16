const db = require("../models/index.js");
const User = db.user; const Binding = db.binding;

exports.create = async (req, res) => {
    try {
        // try to find the user, given its username
        let user = await User.findByPk(req.params.username)
        let child = await User.findOne({ where: { username: req.params.child } });
        let repeated = await Binding.findAll({ where: { child: req.params.child , allUserUsername: req.params.username}})
        console.log(user.username)
        console.log(child.username)
        console.log(repeated)
        if (user === null || child === null)
        return res.status(404).json({
            success: false, msg: `User or child not founded.`
        });
        // Verify if the role is child
        if (child.role != 'child') {
            return res.status(422).json({
                success: false, msg: `${req.params.child} is not a child.`
            });
        }
        // Verify if the child is already connected to this user
        if (repeated.length != 0)
        return res.status(422).json({
            success: false, msg: `The child ${req.params.child} is already connected to user ${req.params.username}.`
        });

        // save connection in the database
        let newBinding = await Binding.create({allUserUsername: req.params.username ,child: child.username, avatar: child.child_avatar})
        //let newBinding = await Binding.create(child);

        // add diary to found username (using a mixin)
        await user.addBinding(newBinding);

        res.status(201).json({
            success: true, msg: `Now ${req.params.username} is connected to child ${req.params.child}.`,
            URL: `/users/${req.params.username}/bindings/${newBinding.id}`
        });
    } catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while creating the connection."
            });
    };
}

exports.findAll = async (req, res) => {
    try {
        // try to find the user, given its ID
        let user = await User.findByPk(req.params.username, {
            //include: Diary
            include: [{
                model: Binding,
                attributes: ['id', 'child', 'avatar']
            }]
        })

        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with username ${req.params.username}.`
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
        let user = await User.findByPk(req.params.username)
        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with username ${req.params.username}.`
            });

        let binding = await Binding.findOne({ where: { child: req.params.child } });
        if (binding === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any connection with ${req.params.child}.`
            });

        let results = await user.hasBinding(binding);
        if (!results)
            return res.status(400).json({
                success: false, msg: `User with username ${req.params.username} does no have connection with ${req.params.child}.`
            });

        let result = await Binding.destroy({ where: { child: req.params.child } })
        // console.log(result)

        if (result == 1) // the promise returns the number of deleted rows
            return res.status(200).json({
                success: true, msg: `Connection with ${req.params.child} was successfully deleted!`
            });
        // no rows deleted -> no user was found
        res.status(404).json({
            success: false, msg: `Cannot find any connection with ${req.params.child}.`
        });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            success: false, msg: `Error connection to username ${req.params.child}.`
        });
    };
};

