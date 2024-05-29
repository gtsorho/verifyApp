"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const user_1 = __importDefault(require("./user"));
const certificate_1 = __importDefault(require("./certificate"));
const individual_1 = __importDefault(require("./individual"));
const certification_pivot_1 = __importDefault(require("./certification_pivot"));
const institution_1 = __importDefault(require("./institution"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
});
const db = {};
db.sequelize = sequelize;
db.Sequelize = sequelize_1.Sequelize;
db.user = (0, user_1.default)(sequelize);
db.institution = (0, institution_1.default)(sequelize);
db.individual = (0, individual_1.default)(sequelize);
db.certification_pivot = (0, certification_pivot_1.default)(sequelize);
db.certificate = (0, certificate_1.default)(sequelize);
db.certificate.belongsTo(db.institution);
db.institution.hasMany(db.certificate);
db.individual.belongsToMany(db.certificate, { through: db.certification_pivot });
db.certificate.belongsToMany(db.individual, { through: db.certification_pivot });
sequelize.sync({ alter: true, force: false })
    .then(() => {
    console.log('All data in sync');
})
    .catch((error) => {
    console.error('Unable to sync the database:', error);
});
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});
exports.default = db;
