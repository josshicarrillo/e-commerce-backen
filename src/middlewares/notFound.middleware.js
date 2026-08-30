export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
  });
};
