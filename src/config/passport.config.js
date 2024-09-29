import passport from 'passport'
import jwt from 'passport-jwt'

const JWTStrategy = jwt.Strategy
const ExtractJwt = jwt.ExtractJwt

const initializePassport = () => {
    passport.use("current" , new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: "coderhouse"
    }, async (jwt_payload , done) => {
        try{
            if(!jwt_payload){
                return done(new Error('UNAUTHORIZED'))
            }
            
            return done(null , jwt_payload)
        }catch(error){
            console.error(error)
            return done(error)
        }
    }))
}

const cookieExtractor = (req) => {
    let token = null

    if(req && req.cookies){
        token = req.cookies["userToken"]
    }

    return token
}

export default initializePassport