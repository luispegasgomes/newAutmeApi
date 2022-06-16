module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define("appointments", {
        allUserUsername: { type: DataTypes.STRING},
        psychologist: { type: DataTypes.STRING},
        date: { type: DataTypes.STRING},
        time: { type: DataTypes.STRING},
        city: { type: DataTypes.STRING},
        avatar: { type: DataTypes.STRING},
    },         
    {timestamps: false,
        createdAt: false,
        updatedAt: false});
    return Appointment;
};