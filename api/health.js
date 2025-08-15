module.exports = function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    message: 'Exchange Student System API is running',
    timestamp: new Date().toISOString()
  });
};
