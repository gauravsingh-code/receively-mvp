//all common functions related to app management will be here
import { config } from '../config/index.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {supabase} from '../config/supabase.js';
import { UnauthorizedError, ValidationError } from '../utils/errors.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const getAppInfo = asyncHandler(async (req , res) => {
    const {data, error} = await supabase.from('app_info').select('*').eq('id', 1).single();
    if(error){
        return res.status(500).json({
            success : false,
            message : 'Failed to fetch app info.',
            error : error.message
        });
    }
    res.status(200).json({
        success : true,
        message : 'App info fetched successfully.',
        data : data
    });
});

export const hashPassword = async (password) => {
    if(!password){
        throw new ValidationError('Password is required ..');
    }
    return await bcrypt.hash(password, 10);
    
};

export const comparePassword = async (password , hashedPassword) => {
    if(!password || !hashedPassword) {
        return  false;
    }
    return await bcrypt.compare(password , hashedPassword);
};

export const validatePassword = (password) => {
    const errors = [];
    if(!password){
        errors.push('Password is required.');
    }else{
        if(password.length < 8) errors.push('Minimum 8 characteres required.');
        if(!/[A-Z]/.test(password)) errors.push('At least one uppercase required.');
        if(!/[a-z]/.test(password)) errors.push('At least 1 lowercase required.');
        if(!/[0-9]/.test(password)) errors.push('At least 1 numeric required.'); 
    }

    if(errors.length > 0){
        throw new ValidationError(errors.join(', '));
    };
};


export const checkEmailExist =async (email) => {
    const data = await supabase.from('users_data').select('user_email').eq('user_email' , email).single();
    if(data.length > 0){
        return false;
    }
    return true;
}

export const generateToken = (payload) => {
    return jwt.sign(payload , process.env.JWT_SECRET, {
        expiresIn:config.jwt.accessExpiry
    });
};

export const verifyToken = (token) => {
    try{
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch(error){
        throw new UnauthorizedError("Invalid or expired token");
    }
};

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.jwt.accessSecret ,{
            expiresIn : config.jwt.accessExpiry,
    });
};

export const generateRefreshToken  = (payload) => {
    return jwt.sign(payload, config.jwt.refreshSecret , {
        expiresIn:config.jwt.refreshExpiry
    });
};

export const verifyAccessToken = (token) => {
    try{
        return jwt.verify(token , config.jwt.accessSecret);
    } catch(error){
        throw new UnauthorizedError("Invalid or expired access token");
    }
};

export const verifyRefreshToken = (token) => {
    try{
        return jwt.verify(token , config.jwt.refreshSecret);
    } catch(error){
        throw new UnauthorizedError("Invalid or expired refresh token");
    }
};

    





