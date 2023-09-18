// app.js
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const Request = require('./models/Request');
const config = require('./config');
const multer = require('multer'); // Import multer for handling file uploads
const fs = require('fs'); // Import the 'fs' module to read the uploaded file

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(config.mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });
// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));

// Routes
app.get('/', (req, res) => {
  res.render('request-form');
});

app.post('/request-download', upload.single('file'), async (req, res) => {
  const { name, email, documentName } = req.body;

  try {
    if (!isValidEmail(email)) {
        return res.status(400).send('Invalid email address');
      }
  
    // Save the request to MongoDB
    const request = new Request({ name, email, documentName });
    await request.save();

    // Send the document download link to the provided email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., 'Gmail'
      auth: {
        user: 'tanyabansal2003@gmail.com',
        pass: 'igoqmzkpipirqsza',
      },
      debug: true, // Add this line
    });

    const mailOptions = {
      from: 'tanyabansal2003@gmail.com',
      to: email,
      subject: 'Document Download Link',
      text: `Hello ${name},\n\nHere is the download link for the document: ${documentName}`,
      attachments: [
        {
          filename: 'document.pdf', // Change the filename as needed
          content: req.file.buffer, // Use the buffer of the uploaded file
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.render('success', { email });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  
  
  
  