import { Schema, model } from "mongoose";

const postSchema = new Schema(
    {
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            maxLength: 500
        },
        img: {
            type: String,
        },
        likes: {
            // Likes contains array of user Ids
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: []
        },
        comments: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    requred: true
                },
                text: {
                    type: String,
                    required: true
                },
                userProfilePic: {
                    type: String
                },
                username: {
                    type: String
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

const Post = model("Post", postSchema);

export default Post;