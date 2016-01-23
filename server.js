var express = require('express')
var app = express()
var serveStatic = require('serve-static')

app.set('port', (process.env.PORT || 5000));

app.use(serveStatic(__dirname + '/static'))
app.use(serveStatic(__dirname + '/build'))

app.listen(app.get('port'), function() {
  console.log('Server running on port', app.get('port'));
});
