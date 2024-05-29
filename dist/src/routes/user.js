"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../controllers/user"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/', user_1.default.createUser);
router.get('/', auth_1.default, user_1.default.getUsers);
router.post('/login', user_1.default.login);
router.get('/:id', auth_1.default, user_1.default.getUser);
router.delete('/:id', auth_1.default, user_1.default.destroyUser);
exports.default = router;
