const User = require('../models/user.models.js');
const bcyrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uploadOnCloudinary, deletOnCloudinary } = require('../utils/cloudinary.js');

// register controller
const registerUser = async(req, res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({
            message: 'Username and passsword is required'
        })
    };

    try {
        // check if user already exists
        const existingUser = await User.findOne({
            username: username
        });
    
        if(existingUser){
            return res.status(400).json({
                message: 'User already exits'
            })
        };

        // Hash the password
        const hashedPassword = await bcyrpt.hash(password, 10);
    
        // Create new user
        const user = new User({
            username: username,
            password: hashedPassword
        });
    
        await user.save();

        // Generate Access Token
        const token = await jwt.sign(
            {
                _id: user._id,
                username: username
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )

        // return the response
        return res.status(201).json({
            message: "User registered successfully",
            data: user,
            token: token
        });
        
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Something went wrong while creating the user'
        })
    }

}

// Login controller
const loginUser = async(req, res) => {
    const { username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({
            message: 'Username and password is required'
        })
    };

    try {

        // Check for the user
        const user = await User.findOne({
            username
        });

        // If user not found
        if(!user){
            return res.status(404).json({
                message: "User dose not exits!"
            })
        };

        // Check if password is correct
        const isPasswordCorrect = await bcyrpt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({
                message: "Invalid credentials"
            })
        };

        // Generate access token
        const token = jwt.sign(
            {
                _id: user._id,
                username: username
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        );

        // return the response
        return res.status(200).json({
            message: "User logged in successfully",
            token: token
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Something went wrong while logging the user'
        });
    }
}

// Profile controllers(Create)
const addProfileDetails = async(req, res) => {
    const {fullName, gender, age, country} = req.body
    
    // Check if required fileds are empty
    if([fullName, gender, age, country].some((field) => field?.trim() === '')){
        return res.status(400).json({message: "fileds are empty"});
    }

    try {
        // Find the user
        const user = await User.findById(req.user?._id);

        // Take image path from request
        const avatarLocalPath = req.files?.avatar[0]?.path;

        if(!avatarLocalPath){
            return res.status(400).json({ message: "Avatar image is required" });
        }

        //upload image on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            return res.status(400).json({ message: "Error occured while uploading on the avatar" })
        }

        // Saving data to the user in Database
        user.fullName = fullName;
        user.gender = gender;
        user.age = age;
        user.country = country;
        user.avatar = avatar?.url;

        
        await user.save();
        
        // Fetch the user details
        const userDetails = await User.findById(req.user?._id);

        // return the response
        return res.status(201).json({
            message: "User details added successfully",
            data: userDetails
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Something went wrong while adding user details'
        });
    }
}

// Profile controller(Update)
const updateUserDetails = async(req, res) => {
    const updateData = req.body;

    // check if fields are empty
    if(!Object.keys(updateData)?.length){
        return res.status(400).json({
            message: "No fields to update"
        });
    }

    try {
        // finding the user
        const user = await User.findById(req.user?._id);

        // Updating the data
        const data = await User.findByIdAndUpdate(
            user._id,
            {
                $set: updateData
            },
            {
                new: true
            }
        );

        if(!data){
            return res.status(500).json({
                message: "Account details not updated"
            })
        }

        // return the response
        return res.status(200).json({
            message: "Account Details updated successfully",
            user: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while updating user details"
        })
    }
};

// Profile controller(Update Image)
const updateUserAvatar = async (req, res) => {
    const avatarLocalPath = req.file?.path;

    // check if image is null
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    // finding the user
    const user = await User.findById(req.user?._id);

    // Get pervious Image
    const previousImageUrl = user?.avatar;

    // Extracting the image name from url
    const previousPublicId = previousImageUrl
    ?.split("/")
    .slice(-1)[0] 
    .split(".")[0];

    // Deleting the pervious image stored on cloudinary
    const deletePreviousAvatar = await deletOnCloudinary(previousPublicId);

    if(!deletePreviousAvatar){
        return res.status(500).json({
            message: 'Pervious avatar is not deleted'
        })
    }

    // Uploading new image
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400, "Error on uploading on avatar")
    }

    // updating the image
    user.avatar = avatar?.url;

    // saving the changes
    await user.save({
        validateBeforeSave: false
    });

    // return the response
    return res.status(200).json( 
        { message: "User profile updated successfully" }
    )
}

// Profile controller(Read)
const getUserDetails = async(req, res) => {
    try {
        // finding the user
        const user = await User.findById(req.user?._id);

        // return the user details
        return res.status(200).json({
            message: "User found successfully",
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching user details"
        });
    }
}

// Profile controller(Delete)
const deleteUserDetails = async(req, res) => {
    try {
        // finding the user
        const user = await User.findById(req.user?._id);
        
        // Finding user pervious avatar
        const previousImageUrl = user?.avatar;
        const previousPublicId = previousImageUrl
        ?.split("/")
        .slice(-1)[0] 
        .split(".")[0];

        // Deleting the pervious avatar url
        const deletePreviousAvatar = await deletOnCloudinary(previousPublicId);

        if(!deletePreviousAvatar){
            return res.status(500).json({
                message: 'Pervious avatar is not deleted'
            })
        }

        // Deleting user details
        await User.findByIdAndUpdate(user._id,
            {
                $unset:{
                    avatar: 1,
                    fullName: 1,
                    age: 1,
                    country: 1,
                    gender: 1
                }
            }
        );

        // return the response
        return res.status(200).json({
            message: "User details deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching user details"
        });
    }
}

module.exports = { 
    registerUser, 
    loginUser,
    addProfileDetails,
    updateUserDetails,
    getUserDetails,
    deleteUserDetails,
    updateUserAvatar
}