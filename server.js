const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require("path");
require('dotenv').config();

const app = express();

// Database and models
const sequelize = require('./config/database');
const Image = require('./model/image');

// Synchronize the model with the database
sequelize.sync();

const uploadDir = './upload/images';

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
                                                                                                                                                                                                                                                                                                                                                                       
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/images', express.static(uploadDir));

app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  next();
});

app.post('/upload', upload.single('images'), async (req, res) => {
  const customHeader = req.headers['x-custom-header'];
  const currentDate = new Date();
  const dateStr = currentDate.toISOString().split('T')[0];
  const timeStr = currentDate.toTimeString().split(' ')[0];
  const dateTimeStr = dateStr + '_' + timeStr.replace(/:/g, '-');
  const imagesUrl = `/images/${dateTimeStr}_${req.file.filename}`;

  try {
    // Store the URL and custom header in the database
    const newImage = await Image.create({
      url: imagesUrl,
      customHeader: customHeader
    });

    res.json({
      success: 1,
      images_url: imagesUrl,
      customHeader: customHeader,
      imageId: newImage.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: 'Database insertion failed' });
  }
});
// app.get('/images/:imageId', async (req, res) => {
//   // res.json({
//   //   status:'success'
//   // })

//     const imageId = req.params.imageId;
//     try {
//       // Retrieve the image data from the database using the imageId
//       const image = await Image.findByPk(imageId);
  
//       if (!image) {
//         res.status(404).json({ success: 0, message: 'Image not found' });
//       } else {
//         // Send the image URL back to the client
//         res.json({
//           success: 1,
//           imageUrl: image.url,
//           customHeader: image.customHeader
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: 0, message: 'Database retrieval failed' });
//     }
//   });

function errHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.json({
      success: 0,
      message: err.message
    });
  }
}

app.use(errHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
