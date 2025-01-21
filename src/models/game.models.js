const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
    {
        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        board: {
            type: [[String]],
            default: [['', '', ''], ['', '', ''], ['', '', '']]
        },
        currentPlayer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
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
        status: {
            type: String,
            default: 'ongoing'
        }
    }
);

module.exports = mongoose.model('Game', gameSchema);