module.exports = (sequelize, DataTypes) => {
    const Binding = sequelize.define("bindings", {
        child: { type: DataTypes.STRING},
        avatar: { type: DataTypes.STRING},
    },         
    {timestamps: false,
        createdAt: false,
        updatedAt: false});
    return Binding;
};