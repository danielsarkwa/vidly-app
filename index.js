const express = require('express'),
      app = express();

      require('./startups/logging')();
      require('./startups/routes')(app);
      require('./startups/db')();
      require('./startups/config')();
      require('./startups/validation')();
      require('./startups/prod')(app);

const port = process.env.PORT || 6202;
const server = app.listen(port, () => console.log(`server up and running on port ${port}`));

module.exports = server;