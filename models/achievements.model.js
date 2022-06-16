module.exports = (sequelize, DataTypes) => {
    const Achievements = sequelize.define("achievements", {
        name: { type: DataTypes.STRING},
        description: { type: DataTypes.STRING},
        imgUrl: { type: DataTypes.STRING},
    },         
    {timestamps: false});
    return Achievements;
};