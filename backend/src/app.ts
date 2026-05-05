import express, {Request, Response} from 'express';
import cors from 'cors';
import authRoutes from './presentation/http/routes/auth.routes';
import reimbursementRoutes from './presentation/http/routes/reembolso.routes';
import categoryRoutes from './presentation/http/routes/categoria.routes';
import userRoutes from './presentation/http/routes/user.routes';
import {errorMiddleware} from './presentation/http/middlewares/errorMiddleware';

const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN ?? '*'}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/reimbursements', reimbursementRoutes);
app.use('/categories', categoryRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({message: 'Rota não encontrada.', statusCode: 404, error: 'Not Found'});
});

app.use(errorMiddleware);

export default app;
