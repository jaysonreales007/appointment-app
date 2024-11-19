import winston from 'winston';

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

export const logActivity = (req: Request, res: Response, next: NextFunction) => {
  auditLogger.info({
    timestamp: new Date(),
    user: req.user?.id,
    action: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
}; 