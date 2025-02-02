const { Router } = require('express');
const { startGame, getMatchHistory, playGameMoves, updateGameStatus } = require('../controllers/game.controllers.js');
const verifyJWT = require('../middlewares/auth.middlewares.js');

const router = Router();

router.route('/start').post(verifyJWT, startGame);

// Id of the game
router.route('/:id/move').post(verifyJWT, playGameMoves);

router.route('/history').get(verifyJWT, getMatchHistory);

// Id of the game to be updated
router.route('/:id/status').patch(verifyJWT, updateGameStatus);

module.exports = router;