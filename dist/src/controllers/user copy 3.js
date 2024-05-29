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
const joi_1 = __importDefault(require("joi"));
const models_1 = __importDefault(require("../models"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let ioInstance; // Assuming the type of ioInstance
exports.default = {
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password } = req.body;
        try {
            const user = yield models_1.default.user.findOne({ where: { username } });
            if (!user || !(yield user.isValidPassword(password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ username: user.username, id: user.id }, process.env.JWT_KEY, { expiresIn: '23h' });
            res.json({ token });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    createUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        function validExtOfficer(user) {
            const schema = joi_1.default.object({
                username: joi_1.default.string().required(),
                phone: joi_1.default.string().allow(null),
                password: joi_1.default.string().required(),
                confirmPassword: joi_1.default.string().valid(joi_1.default.ref('password')).required(),
            });
            return schema.validate(user);
        }
        const { error } = validExtOfficer(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        try {
            const user = yield models_1.default.user.create(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    }),
    getUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield models_1.default.user.findAll();
            res.json(users);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    getUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield models_1.default.user.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            yield user.update(req.body);
            res.json(user);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    destroyUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield models_1.default.user.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            yield user.destroy();
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    })
};
