const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption
const config = require("../config/db.config.js");
const db = require("../models");
const User = db.user;
const Achievement = db.achievement;
const {
    ValidationError
} = require('sequelize');
const {
    user,
    achievement
} = require("../models");

exports.create = async (req, res) => {
    try {
        if (!req.body && !req.body.username && !req.body.password)
            return res.status(400).json({
                success: false,
                msg: "Username and password are mandatory"
            });
        // Save user to DB
        await User.create({
            username: req.body.username,
            email: req.body.email,
            // hash its password (8 = #rounds – more rounds, more time)
            password: bcrypt.hashSync(req.body.password, 10),
            role: req.body.role
        });
        return res.status(201).json({
            success: true,
            msg: "User was registered successfully!",
            uri: `users/${req.body.username}`
        });
    } catch (err) {
        if (err instanceof ValidationError)
            res.status(400).json({
                success: false,
                msg: err.errors.map(e => e.message)
            });
        else
            res.status(500).json({
                success: false,
                msg: err.message || "Some error occurred while signing up."
            });
    };
}

exports.login = async (req, res) => {
    try {
        if (!req.body || !req.body.username || !req.body.password)
            return res.status(400).json({
                success: false,
                msg: "Must provide username and password."
            });
        let user = await User.findOne({
            where: {
                username: req.body.username
            }
        }); //get user data from DB
        if (!user) return res.status(404).json({
            success: false,
            msg: "User not found."
        });
        console.log(req.body.password, user.password)
        // tests a string (password in body) against a hash (password in database)
        const check = bcrypt.compareSync(req.body.password, user.password);
        if (!check) return res.status(401).json({
            success: false,
            accessToken: null,
            msg: "Invalid credentials!"
        });
        // sign the given payload (user ID and role) into a JWT payload – builds JWT token, using secret key
        const token = jwt.sign({
                username: user.username,
                role: user.role
            },
            config.SECRET, {
                expiresIn: '24h' // 24 hours
            });
        return res.status(200).json({
            success: true,
            accessToken: token,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        if (err instanceof ValidationError)
            res.status(400).json({
                success: false,
                msg: err.errors.map(e => e.message)
            });
        else
            res.status(500).json({
                success: false,
                msg: err.message || "Some error occurred at login."
            });
    };
};

exports.getAllUsers = async (req, res) => {
    try {
        if (req.loggedUserRole != "admin")
            return res.status(403).json({
                success: false,
                msg: "This request requires ADMIN role!"
            });
        // do not expose users' sensitive data
        let users = await User.findAll({
            attributes: ['username', 'email', 'role']
        })
        res.status(200).json({
            success: true,
            users: users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving all users."
        });
    };
};

exports.getUser = async (req, res) => {
    try {
        if (req.loggedUserRole != "admin" && req.loggedUserUsername != req.params.username)
            return res.status(403).json({
                success: false,
                msg: "This request requires ADMIN role or the user authenticated!"
            });

        // do not expose users' sensitive data
        let user = await User.findByPk(req.params.username,
            {
            include: {
                model: Achievement,
                through: {
                    attributes: []
                }
            }
        })
       let removePw = user.toJSON() 
        delete removePw['password'];
        res.status(200).json({
            success: true,
            user: removePw
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving this user."
        });
    };
};


exports.getAllPsychologists = async (req, res) => {
    try {

        // do not expose users' sensitive data
        let users = await User.findAll({ 
            where: {
                role: 'psychologist'
            },
        })
        res.status(200).json({
            success: true,
            users: users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving all users."
        });
    };
};

exports.addAchievement = async (req, res) => {
    try {
        // Try to find the user, given its username
        let user = await User.findByPk(req.params.username)
        if (user === null)
            return res.status(404).json({
                success: false,
                msg: `Cannot find any user with username ${req.params.username}.`
            });
        // Aave achievement in the database
        let achievement = await Achievement.findByPk(req.params.idAchievement)
        // Add achievement to found user (using a mixin)
        let result = await user.addAchievement(achievement);
        console.log(result)
        if (result == undefined) {
            return res.status(422).json({
                success: false,
                msg: `The achievement with id ${req.params.idAchievement} is already added to user ${req.params.username}.`
            });
        }
        res.status(201).json({
            success: true,
            msg: `Achievement added to user ${req.params.username}.`,
            URL: `/users/${req.params.idAchievement}/achievements/${achievement.id}`
        });
    } catch (err) {
        console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            res.status(400).json({
                success: false,
                msg: err.errors.map(e => e.message)
            });
        else
            res.status(500).json({
                success: false,
                msg: err.message || "Some error occurred while adding the achievement."
            });
    };
}

exports.deleteAchievement = async (req, res) => {
    try {
        let user = await User.findByPk(req.params.username)
        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with username ${req.params.username}.`
            });

        let achievement = await Achievement.findByPk(req.params.idAchievement)
        if (achievement === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any achievement with id ${req.params.idAchievement}.`
            });

        let results = await user.hasAchievement(achievement);
        if (!results)
            return res.status(400).json({
                success: false, msg: `User ${req.params.username} does not have achievement with id ${req.params.idAchievement}.`
            });

        let result = await Achievement.destroy({ where: { id: req.params.idAchievement } })
        // console.log(result)

        if (result == 1) // the promise returns the number of deleted rows
            return res.status(200).json({
                success: true, msg: `Achievement with id ${req.params.idAchievement} was successfully deleted!`
            });
        // no rows deleted -> no user was found
        res.status(404).json({
            success: false, msg: `Cannot find any achievement with id ${req.params.idAchievement}.`
        });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            success: false, msg: `Error deleting achievement with id ${req.params.idAchievement}.`
        });
    };
};

exports.updatePhoto = async (req, res) => {
    try {
        // since Sequelize update() does not distinguish if a user exists, first let's try to find one
        let user = await User.findByPk(req.params.username);
        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with username ${req.params.username}.`
            });


        if (!req.body.child_avatar) {
            return res.status(404).json({
                success: false, msg: `No avatar found.`
            });
        }

        // obtains only a single entry from the table, using the provided primary key
        let affectedRows = await User.update({ child_avatar: req.body.child_avatar }, { where: { username: req.params.username } })
        
        if (affectedRows[0] === 0) // check if the user was updated (returns [0] if no data was updated)
            return res.status(200).json({
                success: true, msg: `No updates were made on user ${req.params.username}.`
            });

        res.json({
            success: true,
            msg: `Username ${req.params.username} was updated successfully.`
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            return res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        res.status(500).json({
            success: false, msg: `Error retrieving user ${req.params.username}.`
        });
    };
};

exports.updatePw = async (req, res) => {
    try {
        // since Sequelize update() does not distinguish if a user exists, first let's try to find one
        let user = await User.findByPk(req.params.username);
        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with username ${req.params.username}.`
            });


        if (!req.body.password) {
            return res.status(404).json({
                success: false, msg: `No password was provided.`
            });
        }
        let newPw = bcrypt.hashSync(req.body.password, 10)
        
        // obtains only a single entry from the table, using the provided primary key
        let affectedRows = await User.update({ password: newPw }, { where: { username: req.params.username } })
        
        if (affectedRows[0] === 0) // check if the user was updated (returns [0] if no data was updated)
            return res.status(200).json({
                success: true, msg: `No updates were made on user ${req.params.username}.`
            });

        res.json({
            success: true,
            msg: `The user's ${req.params.username} password was updated successfully.`
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            return res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        res.status(500).json({
            success: false, msg: `Error retrieving user ${req.params.username}.`
        });
    };
};

exports.updateEmail = async (req, res) => {
    try {
        // since Sequelize update() does not distinguish if a user exists, first let's try to find one
        let user = await User.findByPk(req.params.username);
        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with username ${req.params.username}.`
            });


        if (!req.body.email) {
            return res.status(404).json({
                success: false, msg: `No email was provided.`
            });
        }
        

        // obtains only a single entry from the table, using the provided primary key
        let affectedRows = await User.update({ email: req.body.email }, { where: { username: req.params.username } })
        
        if (affectedRows[0] === 0) // check if the user was updated (returns [0] if no data was updated)
            return res.status(200).json({
                success: true, msg: `No updates were made on user ${req.params.username}.`
            });

        res.json({
            success: true,
            msg: `The user's ${req.params.username} email was updated successfully.`
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            return res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        res.status(500).json({
            success: false, msg: `Error retrieving user ${req.params.username}.`
        });
    };
};

exports.getPsychologist = async (req, res) => {
    //get data from request query string (if not existing, they will be undefined)
    let {
        page,
        size
    } = req.query;

    // validate page
    if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g))
        return res.status(400).json({
            message: 'Page number must be 0 or a positive integer'
        });
    page = parseInt(page); // if OK, convert it into an integer
    // validate size
    if (size && !req.query.size.match(/^([1-9]\d*)$/g))
        return res.status(400).json({
            message: 'Size must be a positive integer'
        });
    size = parseInt(size); // if OK, convert it into an integer

    // Sequelize function findAndCountAll parameters:
    //      limit -> number of rows to be retrieved
    //      offset -> number of rows to be offseted (not retrieved)
    const limit = size ? size : 3; // limit = size (default is 3)
    const offset = page ? page * limit : 0; // offset = page * size (start counting from page 0)

    try {
        let user = await User.findAndCountAll({
            where: {
                username: req.params.username
            },
            limit,
            offset
        })
        res.status(200).json({
            success: true,
            totalItems: user.count,
            user: user.rows,
            totalPages: Math.ceil(user.count / limit),
            currentPage: page ? page : 0
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving the psychologists."
        })
    }
};
