module.exports = function handler(req, res) {
  res.status(200).json({
    message: 'Test API endpoint is working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
};
