import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import verificationRoutes from './routes/verificationRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import manufacturerRoutes from './routes/manufacturerRoutes.js';
import nafdacRoutes from './routes/nafdacRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoute from './routes/userRoutes.js';
import "dotenv/config";


const app = express();

app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/nafdac', nafdacRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoute)

app.get("/", (req, res) => {
  res.send("Welcome to Lumora API");
});

export default app;
