const errorHandler = (error, req, res, next) => {
  console.error('Lỗi:', error.message, error.stack);

  const statusCode = error.status || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), 
  });
};

module.exports = errorHandler;