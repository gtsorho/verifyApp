import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';

// Define the Certification_Pivot model
const createCertificationModel = (sequelize: Sequelize) => {
  const Certification_Pivot = sequelize.define('Certification_Pivot', {
    issueDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiryDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IndividualId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'uniqueIndividualCertificate'
    },
    CertificateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'uniqueIndividualCertificate'
    }
  });

  return Certification_Pivot;
};

export default createCertificationModel;
