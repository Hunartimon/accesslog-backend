const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const dataReader = require('./dataReader')
const accessData = require('./route/accessDataRoute')

const app = express();
const NODE_PORT = process.env.NODE_PORT || 3001
app.use(cors())
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

const start = async () => {
  try {
    await dataReader.createJSON(path.resolve(__dirname, 'res', 'epa-http.txt'), path.resolve(__dirname, 'res', 'epa-http.json'))
    app.listen(NODE_PORT, () => {
      console.info(`Server is listening on port ${NODE_PORT}`);
    });
  } catch (err) {
    console.log('Couldn\'t initiate server.', err)
  }
}

start()
