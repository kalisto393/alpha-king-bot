export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message)
  
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(status).json({
    ok: false,
    error: message,
    status
  })
}

export const notFound = (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found',
    path: req.path
  })
}
