import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'

export function createApp(){
    const app = express();
    app.use(cors());
    app.use(express.json());

    //Routes
    app.use('/api/auth' , authRoutes);

    //Health Check
    app.get('/health' , (req, res) => {
        res.json({
            status:'ok',
            timestamp : new Date().toISOString(),
        });
    });


    return app;
}
