import { Sequelize, Model, DataTypes } from 'sequelize';


const createCertificationModel = (sequelize: Sequelize) => {
  const Certificate = sequelize.define('Certificate', {
    certificate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prefix: {
      type: DataTypes.STRING,
      allowNull: false
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING, 
      allowNull: false
    }
  }, {
    timestamps: true
  }); 

  return Certificate;
};

export default createCertificationModel;
