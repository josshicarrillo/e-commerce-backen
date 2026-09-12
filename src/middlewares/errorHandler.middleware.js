export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const isDuplicateKey = err.code === 11000;
  const isDuplicateEmail = err.code === 'EMAIL_EXISTS'
    || (isDuplicateKey && (!err.keyPattern || err.keyPattern.email));
  const isDuplicateTicket = isDuplicateKey && err.keyPattern?.user && err.keyPattern?.event;
  const isValidationError = err.name === 'ValidationError' || err.name === 'CastError';
  const statusCode = isDuplicateKey || err.code === 'EMAIL_EXISTS'
    ? 409
    : isValidationError ? 400 : err.statusCode || 500;
  const message = isDuplicateEmail
    ? 'Email already registered'
    : isDuplicateTicket
      ? 'Ya tienes una inscripción activa para este evento'
      : isDuplicateKey
        ? 'El recurso ya existe'
    : err.message || 'Internal server error';

  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};
