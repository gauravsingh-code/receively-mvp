import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'
import clientsRoutes from './routes/clients.routes.js'
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import invoiceRoutes from './routes/invoices.routes.js';
import invoiceSubRoutes from './routes/invoice-sub.routes.js';

export function createApp(){
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Swagger documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Receively API Docs'
    }));

    // Swagger JSON endpoint
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    //Routes
    app.use('/api/auth' , authRoutes);
    app.use('/api/clients' , clientsRoutes);
    app.use('/api/invoices' , invoiceRoutes);
    app.use('/api/invoices/:invoiceId' , invoiceSubRoutes);

    //Health Check
    app.get('/health' , (req, res) => {
        res.json({
            status:'ok',
            timestamp : new Date().toISOString(),
        });
    });


    return app;
}
