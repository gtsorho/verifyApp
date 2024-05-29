"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secretKey = process.env.JWT_KEY || '';
const authenticateToken = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token)
        return res.status(401).send('Access denied. No token provided');
    token = token.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        req.decodedToken = decoded;
        next();
    }
    catch (error) {
        res.status(400).send('Invalid token');
    }
};
exports.default = authenticateToken;
