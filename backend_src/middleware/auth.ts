import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey: string = process.env.JWT_KEY || '';

interface DecodedToken {
    username: string;
    id: string;
    role: string;
    InstitutionID:string
}

declare module 'express' {
    interface Request {
        decodedToken?: DecodedToken;
    }
}

const authenticateToken = (requiredRole: string | string[]) => {
    return (req: ExpressRequest, res: Response, next: NextFunction) => {
        let token: string | undefined = req.header('Authorization');
        if (!token) return res.status(401).send('Access denied. No token provided');
        token = token.split(' ')[1];

        try {
            const decoded: DecodedToken = jwt.verify(token, secretKey) as DecodedToken;
            
            req.decodedToken = decoded;

            if (Array.isArray(requiredRole)) {
                if (!requiredRole.includes(decoded.role)) {
                    return res.status(403).send('Access denied. User does not have the required role');
                }
            } else {
                if (decoded.role !== requiredRole) {
                    return res.status(403).send('Access denied. User does not have the required role');
                }
            }

            next();
        } catch (error) {
            res.status(400).send('Invalid token');
        }
    };
};

export default authenticateToken;
