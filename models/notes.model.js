module.exports = (sequelize, DataTypes) => {
    const Notes = sequelize.define("notes", {
        allUserUsername: { type: DataTypes.STRING},
        title: { type: DataTypes.STRING},
        description: { type: DataTypes.STRING},
        date: { type: DataTypes.STRING},
    },         
    {timestamps: false,
        createdAt: false,
        updatedAt: false});
    return Notes;
};