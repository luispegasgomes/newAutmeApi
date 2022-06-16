const dbConfig = require('../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect
    ,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

// sequelize.authenticate()
//     .then(() => {
//         console.log('Connection has been established successfully.');
//     })
//     .catch(err => {
//         console.error('Unable to connect to the database:', err);
//     });

(async () => {
    try {
        await sequelize.authenticate;
        console.log('Connection has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
})();

const db = {};
db.sequelize = sequelize;

db.user = require("./users.model.js")(sequelize, DataTypes);
db.diary = require("./diaries.model.js")(sequelize, DataTypes);
db.achievement = require("./achievements.model.js")(sequelize, DataTypes);
db.appointment = require("./appointments.model.js")(sequelize, DataTypes);
db.emotions = require("./emotions.model.js")(sequelize, DataTypes);
db.note = require("./notes.model.js")(sequelize, DataTypes);
db.binding = require("./bindings.model.js")(sequelize, DataTypes);
db.images = require("./images.model.js")(sequelize, DataTypes);

db.user.hasMany(db.diary, { onDelete: 'CASCADE' }); // if tutorial is deleted, delete all comments associated with it
db.diary.belongsTo(db.user);

db.user.hasMany(db.note, { onDelete: 'CASCADE' }); // if tutorial is deleted, delete all comments associated with it
db.note.belongsTo(db.user);

db.user.hasMany(db.appointment, { onDelete: 'CASCADE' }); // if tutorial is deleted, delete all comments associated with it
db.appointment.belongsTo(db.user);

db.user.hasMany(db.binding, { onDelete: 'CASCADE' }); // if tutorial is deleted, delete all comments associated with it
db.binding.belongsTo(db.user);

db.user.belongsToMany(db.achievement, { through: 'achievementsInUsers', timestamps: false });
db.achievement.belongsToMany(db.user, { through: 'achievementsInUsers', timestamps: false });



// optionally: SYNC
// db.sequelize.sync()
//     .then(() => {
//         console.log('DB is successfully synchronized')
//     })
//     .catch(e => {
//         console.log(e)
//     });

// optionally: SYNC
/*(async () => {
    try {
        await sequelize.sync();
        console.log('DB is successfully synchronized')
    } catch (error) {
        console.log(e)
    }
})();*/

module.exports = db;
