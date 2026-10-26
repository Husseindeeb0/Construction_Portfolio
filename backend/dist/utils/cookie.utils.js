export const AUTH_COOKIE_NAME = process.env.COOKIE_NAME || 'access_token';
const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/',
        maxAge: 60 * 60 * 1000 // 1 hour default in ms
    };
};
export const setAuthCookie = (res, token) => {
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
};
export const clearAuthCookie = (res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/'
    });
};
