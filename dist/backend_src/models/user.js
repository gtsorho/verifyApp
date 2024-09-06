"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const User = sequelize.define('User', {
        username: sequelize_1.DataTypes.STRING,
        password: sequelize_1.DataTypes.STRING,
        phone: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: "0544069203"
        },
        role: {
            type: sequelize_1.DataTypes.ENUM('admin', 'organization'),
            defaultValue: 'organization'
        },
        InstitutionId: sequelize_1.DataTypes.INTEGER,
    });
    User.beforeCreate((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (user.password) {
            const hash = yield bcrypt_1.default.hash(user.password, 10);
            user.password = hash;
        }
    }));
    User.prototype.isValidPassword = function (password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(password, this.password);
        });
    };
    return User;
};
