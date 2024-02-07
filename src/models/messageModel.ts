import { Schema, model } from "mongoose";

const messageSchema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
        sender: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        seen: {
            type: Boolean,
            default: false
        },
        img: {
            type: String,
            default: "",
        }
    },
    {
        timestamps: true
    }
);

const Message = model("Message", messageSchema);

export default Message;