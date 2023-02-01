import {
    createLogger,
    transports,
    format
} from "winston";

const userLogger = createLogger({
    transports: [
        new transports.File({
            filename: 'user.log',
            level: 'info',
            format: format.combine(format.timestamp(),format.json())
    })
]
});


export default userLogger;

// log messages for some level

// import {userLogger} from "./logger"

// userLogger.log('info', 'info level message');
// userLogger.log('error', 'error level message');
// userLogger.log('debug', 'debug level message');
// userLogger.log('warning', 'warning level message');