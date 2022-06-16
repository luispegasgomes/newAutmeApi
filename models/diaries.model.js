module.exports = (sequelize, DataTypes) => {
    const Diary = sequelize.define("diary", {
        title: {
            type: DataTypes.STRING,
        },
        description: { type: DataTypes.STRING},
        date: { type: DataTypes.STRING},
    }, {
        timestamps: false
    });
    return Diary;
};