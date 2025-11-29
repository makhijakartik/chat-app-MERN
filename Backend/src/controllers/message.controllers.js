import User from "../model/user.model.js"
import Message from "../model/message.model.js"


export const getUsersForSidebar = async(req,res)=>{
    try {
        const loggesOnUserId = req.user._id;
        const filteredUsers = await User.find({ _id: {$ne: loggesOnUserId}}).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getMessages = async(req,res)=>{
    try {
        const { id:userToChatId } = req.params;
        const senderId = req.user._id;

        const message = await Message.find({
            $or:[
                {senderId:senderId, recieverId:userToChatId},
                {senderId:userToChatId, recieverId:senderId}
            ]
        });
        res.status(200).json(message);
    } catch (error) {
        console.log("Error in getMessage Controller ",error.message);
        res.status(500).json({error: "Internal server Error"});
    }
}

export const sendMessage = async(req,res)=>{
    try {
        const { text, image} = req.body;
        const { id:recieverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image:imageUrl
        });

        await newMessage.save();
        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller: ",error.message);        
    }
}