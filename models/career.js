const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide a user id"],
    },
    career: {
        type: String,
        required: [true, "Please provide a career"],
    },
    classs: {
        type: String,
        required: [true, "Please provide a class"],
    },
    college: {
        type: String,
    },
    steps: [{
        title: {
            type: String,
            required: [true, "Please provide a title"],
        },
        description: {
            type: String,
            required: [true, "Please provide a description"],
        }
    }],
});

module.exports = mongoose.model("Career", careerSchema);
