export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const isDuplicateEmail = err.code === 'EMAIL_EXISTS' || err.code === 11000;
  const isValidationError = err.name === 'ValidationError' || err.name === 'CastError';
  const statusCode = isDuplicateEmail ? 409 : isValidationError ? 400 : err.statusCode || 500;
  const message = isDuplicateEmail
    ? 'Email already registered'
    : err.message || 'Internal server error';

  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};
