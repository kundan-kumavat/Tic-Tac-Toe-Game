const multer = require('multer');

const storage = multer.diskStorage({

    // Assigning the destiation to store the file
    destination: function(req, file, cb){
        cb(null, "./public/temp");
    },
    // Filename for the user
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});

const upload = multer({ storage,});

module.exports = {upload};