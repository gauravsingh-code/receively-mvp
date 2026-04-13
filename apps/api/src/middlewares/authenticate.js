import { supabase } from '../config/supabase.js';
import { UnauthorizedError } from '../utils/errors.js';
import { verifyAccessToken } from '../controllers/app.controller.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.id) {
      throw new UnauthorizedError('Invalid token payload');
    }

    // Fetch user from database to attach to request
    const { data: user, error } = await supabase
      .from('users_data')
      .select('id, user_email, self_name, business_name')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request with consistent naming
    req.user = {
      user_id: user.id,
      email: user.user_email,
      name: user.self_name,
      business_name: user.business_name
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};