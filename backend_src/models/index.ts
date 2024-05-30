import { Sequelize } from 'sequelize';
import user from './user';
import certificate from './certificate';
import individual from './individual';
import certification_pivot from './certification_pivot';
import institution from './institution';

import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DATABASE!, 
    process.env.DB_USERNAME!, 
    process.env.DB_PASSWORD!, 
    {
        host: process.env.DB_HOST!,
        port:3306,
        dialect: 'mysql',
        logging: false
    }
);

const db: any = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = user(sequelize);
db.institution = institution(sequelize);
db.individual = individual(sequelize);
db.certification_pivot = certification_pivot(sequelize);
db.certificate = certificate(sequelize);

db.certificate.belongsTo(db.institution) 
db.institution.hasMany(db.certificate)

db.individual.belongsToMany(db.certificate, { through: db.certification_pivot });
db.certificate.belongsToMany(db.individual, { through: db.certification_pivot });

db.certification_pivot.belongsTo(db.individual) 
db.certification_pivot.belongsTo(db.certificate)

console.log('relation',db.certification_pivot.associations)


sequelize.sync({alter: true, force: false})
.then(() => {
    console.log('All data in sync');
})
.catch((error: any) => {
    console.error('Unable to sync the database:', error);
});



sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error: any) => {
    console.error('Unable to connect to the database:', error);
});

export default db;
