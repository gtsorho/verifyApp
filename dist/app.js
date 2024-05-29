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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_1 = __importDefault(require("./backend_src/routes/user"));
const institution_1 = __importDefault(require("./backend_src/routes/institution"));
const certificate_1 = __importDefault(require("./backend_src/routes/certificate"));
const individual_1 = __importDefault(require("./backend_src/routes/individual"));
const models_1 = __importDefault(require("./backend_src/models"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
// API Routes
app.use('/api/users', user_1.default);
app.use('/api/institutions', institution_1.default);
app.use('/api/certificate', certificate_1.default);
app.use('/api/individual', individual_1.default);
// Path to the Angular app's build output
const angularDistDir = path_1.default.join(__dirname, '../verify_ui/dist/browser');
// Serve static files from the Angular app's build output directory
app.use(express_1.default.static(angularDistDir));
// Catch-all route to serve Angular's index.html for non-API routes
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(angularDistDir, 'index.html'));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Graceful shutdown
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Closing database connection...');
    yield models_1.default.close();
    console.log('Database connection closed.');
    process.exit(0);
}));
