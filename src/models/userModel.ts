import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            minLength: 6,
            required: true
        },
        confirm_password: {
            type: String,
            minLength: 6,
            required: true
        },
        profilePic: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
            default: ""
        },
        followers: {
            type: [String],
            default: []
        },
        following: {
            type: [String],
            default: []
        },
        isFrozen: {
            type: Boolean,
            default: false
        },
        location: {
            address: {
                type: String
            },
            coordinates: {
                type: [Number]
            }
        }
    },
    {
        timestamps: true
    }
);

const User = model("User", userSchema);

export default User;