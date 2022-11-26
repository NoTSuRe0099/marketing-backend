export const errorMiddleware = (err: any, req: any, res: any, next: any) => {
  err.message = err.message || 'Internal Server Error';
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const asyncError = (passedFunction: any) => (req: any, res: any, next: any) => {
  Promise.resolve(passedFunction(req, res, next)).catch(next);
};
