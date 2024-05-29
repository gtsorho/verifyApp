import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './backend_src/routes/user';
import institutionsRoutes from './backend_src/routes/institution';
import certificateRoutes from './backend_src/routes/certificate';
import individualRoutes from './backend_src/routes/individual';
import sequelize from './backend_src/models';

const app: express.Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/individual', individualRoutes);

// Path to the Angular app's build output
const angularDistDir = path.join(__dirname, '../verify_ui/dist/browser');

// Serve static files from the Angular app's build output directory
app.use(express.static(angularDistDir));

// Catch-all route to serve Angular's index.html for non-API routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(angularDistDir, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await sequelize.close();
  console.log('Database connection closed.');
  process.exit(0);
});
