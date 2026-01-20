import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

interface JwtPayload {
  id: number;
  email: string;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    res.status(401).json({ error: 'Token error' });
    return;
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).json({ error: 'Token malformatted' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const payload = decoded as JwtPayload;
    req.userId = payload.id;
    req.userEmail = payload.email;
    return next();
  });
};

export default authMiddleware;
