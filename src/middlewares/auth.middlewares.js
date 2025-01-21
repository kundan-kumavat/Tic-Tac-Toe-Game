const jwt = require('jsonwebtoken');
const SECRET_TOKEN = 'TicTacToe';
const User = require('../models/user.models.js');

const verifyJWT = async(req, res, next) => {

    let token = req.headers.authorization;
    try {

        if(token){
            token = token.split(" ")[1];
            let decodedToken = jwt.verify(token, SECRET_TOKEN);

            const user = await User.findById(decodedToken?._id).select("-password")
            if(!user){
                return res.status(401).json({message: "Invlaid token"});
            }

            req.user = user;
            
        }else{
            return res.status(400).json({
                message: "Unathorized user"
            });
        }

        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({message: "Something went wrong"});
    }
}

module.exports = verifyJWT;