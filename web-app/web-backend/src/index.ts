import express, { Request, Response } from 'express';
import 'dotenv/config';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join('.', 'public')));

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all route for the React app
app.get(/.*/, (req: Request, res: Response) => {
  res.sendFile(path.resolve('.', 'public', 'index.html'));
});

// // Error handling middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});


app.listen(PORT, () => {
  console.log(`Web backend server is running on port ${PORT}`);
});

export default app;