export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user?.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'No tenés permisos para realizar esta acción',
    });
  }

  return next();
};

export const authorizeEventOwner = (getEvent, param = 'id') => async (req, res, next) => {
  try {
    if (req.user?.role === 'admin') return next();

    const event = await getEvent(req.params[param]);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Evento no encontrado',
      });
    }
    if (event.organizer?.toString() !== req.user?.id?.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'No tenés permisos para realizar esta acción',
      });
    }

    req.event = event;
    return next();
  } catch (error) {
    return next(error);
  }
};