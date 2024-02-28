const jwt = require('jsonwebtoken');


module.exports = (req, res, next)=>{
    const token = req.headers.authorization;
    console.log(token)

    if(!token){
        return res.status(401).json({error: 'Unauthorized - No token provided'})
    }

    const secretKey = "say_my_name_y_a_d_e_s_h"

    try{

        const decodedToken = jwt.verify(token, secretKey);

        req.user = decodedToken;
        console.log(req.user);
        next();

    }catch(error){
        console.error('Error during token verification:', error);

        return res.status(401).json({ error: 'Unauthorized - Invalid token' });

    }
}