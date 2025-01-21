const Game = require('../models/game.models.js');

const startGame = async (req, res) => {
    const { opponentId } = req.body;
    try {
        const game = new Game({
            players: [req.user?.id, opponentId],
            currentPlayer: req.user?.id,
        });
        await game.save();
        res.status(201).json(game);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Game not started! Try again"
        })
    }
};


const playGameMoves = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).populate('players', 'username');
        if (!game || game.status !== 'ongoing') {
            return res.status(400).send('Invalid game or game is not active');
        }
    
        if (String(game.currentPlayer) !== req.user.id) {
            return res.status(400).send('Not your turn');
        }
    
        const { row, col } = req.body;
        if (game.board[row][col]) {
            return res.status(400).send('Invalid move');
        }
    
        // Assign 'X' to the first player and 'O' to the second player
        const currentSymbol = game.players[0]._id.toString() === req.user.id ? 'X' : 'O';
        game.board[row][col] = currentSymbol;
        game.moves.push({ player: req.user.id, position: { row, col } });
    
    
        const checkWin = (board) => {
            for (let i = 0; i < 3; i++) {
                if (
                    (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) ||
                    (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i])
                ) {
                    return true;
                }
            }
            if (
                (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) ||
                (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0])
            ) {
                return true;
            }
            return false;
        };
    
        if (checkWin(game.board)) {
            game.winner = req.user.id;
            game.status = 'completed';
            await game.save();
            const winnerIndex = game.players.findIndex((player) => player._id.toString() === req.user.id);
            return res.status(200).json({
                message: `Player ${winnerIndex + 1} (${req.user.id === game.players[0]._id.toString() ? 'X' : 'O'}) wins!`
            });
        } else if (game.moves.length === 9) {
            game.status = 'draw';
            await game.save();
            return res.status(200).json({ message: 'The game is a draw!' });
        } else {
            game.currentPlayer = game.players.find((player) => player._id.toString() !== req.user.id);
            await game.save();
            return res.status(200).json({ message: 'Move accepted', game });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while palying the moves"
        });
    }
};

const getMatchHistory = async (req, res) => {
    try {
        const games = await Game.find({ players: req.user?.id })
            .populate('players', 'username')
            .select('players winner moves status');

        const formattedHistory = games.map((game) => {
            const isUserWinner = game.winner?.toString() === req.user.id;
            const opponent = game.players.find((player) => player._id.toString() !== req.user.id);
            const userMoves = game.moves
                .filter((move) => move.player.toString() === req.user.id)
                .map((move) => ({
                    position: move.position,
                    timestamp: move._id.getTimestamp(), // Assuming Mongoose ObjectId has timestamp
                }));
            const opponentMoves = game.moves
                .filter((move) => move.player.toString() !== req.user.id)
                .map((move) => ({
                    position: move.position,
                    timestamp: move._id.getTimestamp(),
                }));

            return {
                gameId: game._id,
                opponentUsername: opponent?.username || 'Unknown',
                status: game.status,
                result: isUserWinner ? 'Win' : game.winner ? 'Loss' : 'Draw',
                movesTimeline: {
                    userMoves,
                    opponentMoves,
                },
            };
        });

        res.status(200).json({
            message: 'Game history fetched successfully',
            data: formattedHistory,
        });
    } catch (error) {
        console.error('Error fetching game history:', error);
        res.status(500).json({
            message: 'An error occurred while fetching game history',
            error: error.message,
        });
    }
};


const updateGameStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const game = await Game.findById(req.params.id);
    
        if (!game || game.status !== 'ongoing') {
            return res.status(400).send('Game is not ongoing or does not exist');
        }
    
        game.status = status;
        await game.save();
        res.status(200).send('Game status updated');
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while updating the status"
        });
    }
};

module.exports = {
    startGame,
    playGameMoves,
    getMatchHistory,
    updateGameStatus
}