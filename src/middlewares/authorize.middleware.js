export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user?.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'No tenés permisos para realizar esta acción',
    });
  }

  return next();
};

export const authorizeEventOwner = (getEvent) => async (req, res, next) => {
  try {
    if (req.user?.role === 'admin') return next();

    const event = await getEvent(req.params.id);
    if (!event || event.organizer?.toString() !== req.user?.id?.toString()) {
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