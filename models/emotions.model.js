module.exports = (sequelize, DataTypes) => {
    const Emotions = sequelize.define("emotions", {
        name: { type: DataTypes.STRING},
        hint: { type: DataTypes.STRING},
        img: { type: DataTypes.STRING},
    },         
    {timestamps: false,
        createdAt: false,
        updatedAt: false});
    return Emotions;
};