require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
});
