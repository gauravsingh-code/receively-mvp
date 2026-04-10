import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from "../utils/errors.js";
import {
  validatePassword,
  hashPassword,
  comparePassword,
  generateToken,
  checkEmailExist,
  verifyToken,
  verifyAccessToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./app.controller.js";

export const register = asyncHandler(async (req, res) => {
  const {
    self_name,
    password_hash,
    business_name,
    user_email,
    logo_url,
    currency,
    payment_method,
  } = req.body;
  if (!self_name || !user_email || !password_hash) {
    throw new ValidationError("Email, name and passwords are required.");
  }
  //checking existing user
  const isUserExist = await checkEmailExist(user_email);
  if (isUserExist)
    throw new ConflictError(
      "User with this email already exist. Please try to login.",
    );
  //validate password
  validatePassword(password_hash);

  //hash password
  const hashedPassword = await hashPassword(password_hash);

  const { data, error } = await supabase
    .from("users_data")
    .insert({
      self_name,
      password_hash: hashedPassword,
      business_name,
      user_email,
      logo_url,
      currency,
      payment_method,
    })
    .select();

  if (error) {
    throw new ValidationError(error.message);
  }

  console.log("User Registered successfully: ", data);
  if (error) {
    throw new ValidationError(error.message);
  }

  res.status(201).json({
    success: true,
    message: "user registered successfully.",
    data: {
      id: data[0].id,
      self_name: data[0].self_name,
      password_hash: data[0].password_hash,
      business_name: data[0].business_name,
      user_email: data[0].user_email,
      logo_url: data[0].logo_url,
      currency: data[0].currency,
      payment_method: data[0].payment_method,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { password, email } = req.body;

  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }

  const { data, error } = await supabase
    .from("users_data")
    .select("id , user_email , password_hash")
    .eq("user_email", email)
    .single();
  if (error || !data) throw new UnauthorizedError("Invalid email or password");
  // console.log('data' , data);
  const isPasswordValid = await comparePassword(password, data.password_hash);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const payload = {
    id: data.id,
    email: data.user_email,
  };

  //jwt generation
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in the database
    const { error: tokenError } = await supabase.from('refresh_tokens').insert({
        user_id: data.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    if(tokenError){
        throw new Error('Failed to store refresh token');
    }
  res.json({
    success: true,
    message: "Login successful",
    data,
    accessToken, // lived for only 15 min used for api calls
    refreshToken // lived for 7 days used to get new access token after expiry
  });
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new UnauthorizedError("No token is provided.");

  const decoded = verifyAccessToken(token);
  console.log("Decoded from jwt: ", decoded);

  //fetch user from the db
  const { data, error } = await supabase
    .from("users_data")
    .select(
      "id, self_name, business_name,user_email, logo_url, currency, payment_method",
    )
    .eq("id", decoded.id)
    .single();
  if (error || !data) {
    throw new UnauthorizedError("User Not found.");
  }

  res.json({
    success: true,
    message: "profile fetched successfully .",
    data,
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        // Revoke refresh token from DB — truly logs user out
        await supabase.from('refresh_tokens').delete().eq('token', refreshToken);
    }

    res.json({
        success: true,
        message: 'Logout successful'
    });
});


export const refresh = asyncHandler(async (req, res) => {
    const {refreshToken} = req.body;
    if(!refreshToken) throw new UnauthorizedError('Refresh Token is required.');

    //verify this token
    const decoded = verifyRefreshToken(refreshToken);
    console.log('decoded refresh token: ', decoded);

    //check in the db that given refresh token is present or removed
    const {data , error } = await supabase.from('refresh_tokens').select('*').eq('user_id', decoded.id).eq('token',refreshToken).single();
    console.log("DATA: ", data);
    if(error || !data){
        throw new UnauthorizedError('Refresh token is revoked.');
    }
    const token = generateAccessToken({id:decoded.id ,email:decoded.email});

    return res.status(200).json({
        success : true,
        message : "access token generated successfully.",
        accessToken : token,
    });
});