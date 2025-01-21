const User = require('../models/user.models.js');
const bcyrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uploadOnCloudinary, deletOnCloudinary } = require('../utils/cloudinary.js');

const registerUser = async(req, res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({
            message: 'Username and passsword is required'
        })
    };

    try {
        const existingUser = await User.findOne({
            username: username
        });
    
        if(existingUser){
            return res.status(400).json({
                message: 'User already exits'
            })
        };
    
        const hashedPassword = await bcyrpt.hash(password, 10);
    
        const user = new User({
            username: username,
            password: hashedPassword
        });
    
        await user.save();

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

const loginUser = async(req, res) => {
    const { username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({
            message: 'Username and password is required'
        })
    };

    try {
        const user = await User.findOne({
            username
        });

        if(!user){
            return res.status(404).json({
                message: "User dose not exits!"
            })
        };

        const isPasswordCorrect = await bcyrpt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({
                message: "Invalid credentials"
            })
        };

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

const addProfileDetails = async(req, res) => {
    const {fullName, gender, age, country} = req.body
    
    if([fullName, gender, age, country].some((field) => field?.trim() === '')){
        return res.status(400).json({message: "fileds are empty"});
    }

    try {
        const user = await User.findById(req.user?._id);

        const avatarLocalPath = req.files?.avatar[0]?.path;

        if(!avatarLocalPath){
            return res.status(400).json({ message: "Avatar image is required" });
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            return res.status(400).json({ message: "Error occured while uploading on the avatar" })
        }

        user.fullName = fullName;
        user.gender = gender;
        user.age = age;
        user.country = country;
        user.avatar = avatar?.url;

        
        await user.save();

        const userDetails = await User.findById(req.user?._id);

        return res.status(200).json({
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

const updateUserDetails = async(req, res) => {
    const updateData = req.body;

    if(!Object.keys(updateData)?.length){
        return res.status(400).json({
            message: "No fields to update"
        });
    }

    try {
        const user = await User.findById(req.user?._id);

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

const updateUserAvatar = async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const user = await User.findById(req.user?._id);

    const previousImageUrl = user?.avatar;
    const previousPublicId = previousImageUrl
    ?.split("/")
    .slice(-1)[0] 
    .split(".")[0];

    const deletePreviousAvatar = await deletOnCloudinary(previousPublicId);

    if(!deletePreviousAvatar){
        return res.status(500).json({
            message: 'Pervious avatar is not deleted'
        })
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400, "Error on uploading on avatar")
    }

    user.avatar = avatar?.url;

    await user.save({
        validateBeforeSave: false
    });

    return res.status(200).json( 
        { message: "User profile updated successfully" }
    )
}

const getUserDetails = async(req, res) => {
    try {
        const user = await User.findById(req.user?._id);

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

const deleteUserDetails = async(req, res) => {
    try {
        const user = await User.findById(req.user?._id);

        const previousImageUrl = user?.avatar;
        const previousPublicId = previousImageUrl
        ?.split("/")
        .slice(-1)[0] 
        .split(".")[0];

        const deletePreviousAvatar = await deletOnCloudinary(previousPublicId);

        if(!deletePreviousAvatar){
            return res.status(500).json({
                message: 'Pervious avatar is not deleted'
            })
        }


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