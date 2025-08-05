import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";

// GOO0GLE_CLIENT_SECRET =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Test
// GO0OGLE_CLIENT_ID=935529932618-6cdbidj6do6glvd0b01djms8kcqplk1g.apps.googleusercontent.com

passport.use(
    new GoogleStrategy(
        {
           clientID : envVars.GOOGLE_CLIENT_ID,
           clientSecret: envVars.GOOGLE_CLIENT_SECRET,
           callbackURL: envVars.GOOGLE_CALLBACK_URL
        }, async (accessToken: string,refreshToken:string, profile: Profile,done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value;

                if(!email){
                    return done(null, false, { message:"No email found" })
                }

                
                 let user = await User.findOne({email})

                 if(!user){
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVerified: true,
                        auths: [
                           {
                             provider: "google",
                            providerId: profile.id
                           }
                        ]
                    })
                 }

                return done(null, user)
            } catch (error) {
                console.log("Google strategy error",error)
                return done(error)
            }

           
        }
        
    )
)

passport.serializeUser((user:any, done: (err: any, id?:unknown) => void) => {
    done(null,user.id);
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null,user);
    } catch (error) {
        console.log(error);
        done(error);
    }
})