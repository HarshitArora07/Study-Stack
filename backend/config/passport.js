const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/User")

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value

        // ✅ Find by email (IMPORTANT)
        let user = await User.findOne({ email })

        if (user) {
          // attach googleId if missing
          if (!user.googleId) {
            user.googleId = profile.id
            await user.save()
          }

          return done(null, user)
        }

        // create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email
        })

        return done(null, user)

      } catch (err) {
        return done(err, null)
      }
    }
  )
)

// session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})