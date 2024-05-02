const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/mydatabase';

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }

  console.log('Connected to MongoDB');

  // Close the MongoDB connection
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    // Rest of the code
  });
  
  client.close();
});
