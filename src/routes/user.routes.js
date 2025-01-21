const { Router } = require('express');
const { registerUser, 
    loginUser, 
    addProfileDetails, 
    deleteUserDetails, 
    getUserDetails, 
    updateUserAvatar, 
    updateUserDetails
} = require('../controllers/user.controllers.js');
const verifyJWT = require('../middlewares/auth.middlewares.js');
const { upload } = require('../middlewares/multer.middlewares.js');


const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/profile').post(verifyJWT,
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        }
    ]),
    addProfileDetails
);
router.route('/profile').put(verifyJWT, updateUserDetails);
router.route('/profile').delete(verifyJWT, deleteUserDetails);
router.route('/profile').get(verifyJWT, getUserDetails);
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);

module.exports = router;