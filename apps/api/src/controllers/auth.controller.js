import {supabase} from '../config/supabase.js';
import { asyncHandler} from '../utils/asyncHandler.js';
import {ValidationError, UnauthorizedError} from '../utils/errors.js';

export const register = asyncHandler(async (req , res) => {
    const {email , password, name} = req.body;
    if(!email || !password){
        throw new ValidationError('Email and passwords are required.');
    }

    if(password.length < 6){
        throw new ValidationError('Passwords must be atleast 6 characters long .');
    }

    const {data , error} = await supabase.auth.signUp({
        email,
        password,
        options:{
            data : {name : name || ''},
        }
    });

    console.log('Data: ', data);
    if(error){
        throw new ValidationError(error.message);
    }

    res.status(201).json({
        success : true,
        message : 'User registered successfully.',
        data : {
            id : data.user.id,
            email : data.user.email,
            name:data.user.user_metadata?.name,
        }
    });
});

export const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    
    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }

    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new UnauthorizedError('Invalid email or password');
    }

    res.json({
        success : true,
        message : 'Login successful.',
        data :{
            user : {
                id : data.user.id,
                email : data.user.email,
                name : data.user.user_metadataa?.name,
            },
            session:{
                access_token : data.session.access_token,
                refresh_token : data.session.refresh_token,
                expires_at : data.session.expires_at,
            },
        },
    });
});


/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        created_at: user.created_at,
      },
    },
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  res.json({
    success: true,
    message: 'Logout successful',
  });
});