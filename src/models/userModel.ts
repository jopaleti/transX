import { Schema, model, Types, Document } from "mongoose";


// Defining User Interface
export interface user extends Document {
    _id: Types.ObjectId,
    name: string,
    username: string,
    email: string,
    password: string,
    confirm_password: string,
    profilePic?: string,
    bio?: string,
    followers?: [string],
    following?: string,
    isFrozen?: boolean,
    location?: any
}


const userSchema = new Schema<user>(
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

const User = model<user>("User", userSchema);

export default User;