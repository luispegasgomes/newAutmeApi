module.exports = (sequelize, DataTypes) => {
    const Images = sequelize.define("images", {
        name: { type: DataTypes.STRING},
        question: { type: DataTypes.STRING},
        correctAnswer: { type: DataTypes.STRING},
        wrongAnswer: { type: DataTypes.STRING},
        img: { type: DataTypes.STRING},
    },         
    {timestamps: false,
        createdAt: false,
        updatedAt: false});
    return Images;
};