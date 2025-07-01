// utils/logger.js
import fs from 'fs';
import path from 'path';

// Fonction pour masquer les données sensibles
const sanitizeData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const sensitiveFields = ['password', 'email', 'token', 'authorization', 'jwt', 'secret'];
    const sanitized = { ...data };

    for (const key in sanitized) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }

    return sanitized;
};

// Logger sécurisé
class SecureLogger {
    constructor() {
        this.logDir = './logs';
        this.createLogDir();
    }

    createLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const sanitizedData = data ? sanitizeData(data) : null;

        return JSON.stringify({
            timestamp,
            level,
            message,
            data: sanitizedData,
            pid: process.pid
        }) + '\n';
    }

    writeToFile(filename, content) {
        if (process.env.NODE_ENV === 'production') {
            const filePath = path.join(this.logDir, filename);
            fs.appendFileSync(filePath, content);
        }
    }

    info(message, data = null) {
        const logMessage = this.formatMessage('INFO', message, data);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[INFO] ${message}`, data ? sanitizeData(data) : '');
        }
        this.writeToFile('app.log', logMessage);
    }

    error(message, data = null) {
        const logMessage = this.formatMessage('ERROR', message, data);
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[ERROR] ${message}`, data ? sanitizeData(data) : '');
        }
        this.writeToFile('error.log', logMessage);
    }

    warn(message, data = null) {
        const logMessage = this.formatMessage('WARN', message, data);
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[WARN] ${message}`, data ? sanitizeData(data) : '');
        }
        this.writeToFile('app.log', logMessage);
    }

    debug(message, data = null) {
        if (process.env.NODE_ENV !== 'production') {
            const logMessage = this.formatMessage('DEBUG', message, data);
            console.log(`[DEBUG] ${message}`, data ? sanitizeData(data) : '');
            this.writeToFile('debug.log', logMessage);
        }
    }
}

export default new SecureLogger();
