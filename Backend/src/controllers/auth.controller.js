import cloudinary from "../lib/cloudinary.js";
import { generateTokens } from "../lib/utils.js";
import User from "../model/user.model.js";
import bcrypt from 'bcryptjs'

export const signup = async(req,res)=>{

    const { fullName, email, password } = req.body;
    try {

        if(!password || !fullName || !email){
            return res.status(400).json({message: "Give all credentials"})
        }

        if(password.length < 6){
            return res.status(400).json({message:"Password length should be greater than 6 characters"});
        }

        const user = await User.findOne({email});
        if(user) return res.status(400).json({message:"User already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName:fullName,
            email:email,
            password:hashedPassword
        });

        if(newUser){
            generateTokens(User._id,res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic
            });
        }else{
            res.status(400).json({message:"Invalid User data"});
        }

    } catch (error) {
        console.log("Error in signup controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const login = async (req,res)=>{

    const { email, password } = req.body;

    try {
        const user = await User.findOne({email});

        if(!user) return res.status(400).json({message:"Incorrect credentials"});
        const isPassCorrect = await bcrypt.compare(password, user.password);
        if(!isPassCorrect) return res.status(400).json({message:"Invalid Credentials"});

        generateTokens(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email
        });
    } catch (error) {
        console.log("Login error occured "+ error.message);
        res.status(500).json("Login Error occured");
    }
}

export const logout = async (req,res)=>{
    try {
        res.cookie("jwt","",{maxAGE:0});
        res.status(200).json({message:"Logout successful"});

    } catch (error) {
        console.log("Logout unsuccessful ",error.message);
        res.status(500).json("Internal error occured");
    }
}

export const updateProfile = async (req,res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic) return res.status(400).json({message: "Profile pic is required"});

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("error in update profile" + error.message);
        res.status(500).json({message: "Internal server error"})

    }
}

export const checkAuth = async (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller ",error.message);
        res.status(500).json({message:"Internal Error occured"});
    }
}