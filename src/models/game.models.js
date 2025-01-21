const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
    {
        // list of players
        players: [
            {
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User'
            }
        ],
        // Empty board
        board: {
            type: [[String]],
            default: [['', '', ''], ['', '', ''], ['', '', '']]
        },
        // current player turn
        currentPlayer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        // winner of the game
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        // moves played during the game
        moves: [
            {
                player: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                position: {
                    row: Number,
                    col: Number
                }
            }
        ],
        // current status of the game
        status: {
            type: String,
            default: 'ongoing'
        }
    }
);

module.exports = mongoose.model('Game', gameSchema);