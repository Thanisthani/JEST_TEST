import { AppError } from "../../utils/errorHandler";
import userLogger from "../../utils/logger"

const handleKnownExceptions = (err : any, res : any ) => {
    const { statusCode, message } = err;
    userLogger.log('error', message)
    console.log("ithu error",message);
    res.status(statusCode).json({error: message});
};

const handleUnknownExceptions = (err : any, res : any) => {
    userLogger.log('error',err.message)
    res.status(500).json({ error: 'Something went wrong.' });
};


export const errorMiddleware= (err : any,req : any,res : any ,next : any) => {
    err instanceof AppError ? handleKnownExceptions(err,res) : handleUnknownExceptions(err,res)

} 