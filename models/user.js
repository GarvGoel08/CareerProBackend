// User Model
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
  },
  otp: {
    code: Number,
    expiry: {
        type: Date,
        default: Date.now(),
    }
  }
},

{ timestamps: true });

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods = {
    authenticate: async function(password){
        return await bcrypt.compare(password, this.password)
    },
    getJWTToken: function(){
        return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        })
    }
};

module.exports = mongoose.model("User", userSchema);