import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';

const createIndividualModel = (sequelize: Sequelize) => {
  const Individual = sequelize.define('Individual', {
    organization: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:'individual'
    },
    ghana_card: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });

  return Individual;
};

export default createIndividualModel;
