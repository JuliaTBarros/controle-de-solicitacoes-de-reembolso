import {Request, Response, NextFunction} from 'express';
import {AnyZodObject} from 'zod';

export function validate(schema: AnyZodObject) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({body: req.body, params: req.params, query: req.query});
            next();
        } catch (err) {
            next(err);
        }
    };
}
