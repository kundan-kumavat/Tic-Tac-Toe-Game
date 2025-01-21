const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const uploadOnCloudinary = async (localFilePath) => {
    try {

        cloudinary.config(
            {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            }
        );

        if (!localFilePath) return null;

        // Uploading image
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })
            .catch((error) => {
                console.log(error);
            });
        // console.log(response);

        // removing the image from the system
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const deletOnCloudinary = async (oldImage) => {
    try {

        cloudinary.config(
            {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            }
        );

        if (!oldImage) return null;

        // delete the image
        await cloudinary.api
        .delete_resources(
            [oldImage],
            { type: 'upload', resource_type: 'image' }
        )
        .then(console.log);
        return true;


    } catch (error) {
        return null;
    }
}

module.exports = { uploadOnCloudinary, deletOnCloudinary }