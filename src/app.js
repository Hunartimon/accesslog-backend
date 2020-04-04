const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const readData = require('./dataReader').readData
const accessData = require('./route/accessDataRoute')

const app = express();
const NODE_PORT = process.env.NODE_PORT || 3001

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/accessData', accessData)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
});

app.listen(NODE_PORT, () => {
  console.info(`Server is listening on port ${NODE_PORT}`);
});
