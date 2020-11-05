exports.success = function (req, res, message, status) {
  const statusCode = status || 200;

  res.status(statusCode).send({
    error: false,
    status: statusCode,
    body: message,
  });
};

exports.error = function (req, res, message, status) {
  const statusCode = status || 500;
  const statusMessage = message || 'Internal error';
  res.status(statusCode).send({
    error: statusMessage,
    status: statusCode,
    body: false,
  });
};
