import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/appError';
import { Response } from 'express';


const devErrors = (res: Response, error: any) => {
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}

const prodErrors = (res:Response, error :any) => {
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message
        });
    }else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong! Please try again later.'
        })
    }
}

const validationErrorHandler = (err: any) => {
    const errors = Object.values(err.errors).map((val: any) => val.message);
    const errorMessages = errors.join('. ');
    const msg = `Invalid input data: ${errorMessages}`;

    return new AppError(msg, 400);
}

const duplicateKeyErrorHandler = (err: any) => {
    const name = err.keyValue.name;
    const msg = `There is already a movie with name ${name}. Please use another name!`;

    return new AppError(msg, 400);
}

const castErrorHandler = (err :any) => {
    const msg = `Invalid value for ${err.path}: ${err.value}!`
    return new AppError(msg, 400);
}

const errorHandlerMiddleware = (
    err: any,
    req: any,
    res: any,
    next: () => void
) => {
    console.log("---errorHandlerMiddleware---");
    console.log(err);
    let error: AppError;

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        // console.log("dev error", err);
        devErrors(res, err);
    }
    else if (process.env.NODE_ENV === 'production') {
        console.log("prod error");
        if (err.name === "ValidationError")
            err = validationErrorHandler(err);
        if (err.code === 11000)
            err = duplicateKeyErrorHandler(err);
        if (err.name === "CastError")
            err = castErrorHandler(err);

        prodErrors(res, err);
    }
}
export default errorHandlerMiddleware;

