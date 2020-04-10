import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
// const GoogleStrategy = require('passport-google-oauth20').Strategy

export const facebookPassportConfig = () => {
  return passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://localhost:4444/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'name', 'email'],
        passReqToCallback: true,
      },
      function (req, accessToken, refreshToken, profile, done) {
        try {
          if (profile) {
            req.user = profile
            done(null, profile)
          }
        } catch (error) {
          done(error)
        }
      }
    )
  )
}
