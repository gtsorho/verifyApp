import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';


const createInstitutionModel = (sequelize: Sequelize) => {
  const Institution = sequelize.define('Institution', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accreditation: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Institution; 
};

export default createInstitutionModel;
