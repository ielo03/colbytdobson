import mongoose from "mongoose";
import bcrypt from "bcrypt";

const saltRounds = 10;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        next();
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.password)) {
        const err = new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        err.code = 400;
        return next(err);
    }

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            next(err);
            return;
        }

        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) {
                next(err);
                return;
            }
            this.password = hash;
            next();
        });
    });
});

userSchema.pre("save", function (next) {
    const user = this;

    const usernameRegex = /^[a-zA-Z0-9_\-]{3,20}$/;

    if (!usernameRegex.test(user.username)) {
        const err = new Error("Invalid username. Username must be 3-20 characters long and can only contain letters, numbers, hyphens, and underscores.");
        err.code = 400;
        next(err);
        return;
    }

    next();
});

const User = mongoose.model("User", userSchema);

export default User;