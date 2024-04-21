// Konfiguration in einer Initialisierungsdatei oder direkt in deinem App-Setup:
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: "id",
      clientSecret: "pw",
      callbackURL: "http://localhost/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("profilee breeeeee", profile);
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = new User({
          googleId: profile.id,
          username: profile.name.givenName,
          googleId: profile.id,
        });
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

// Sorge dafür, dass Passport die Nutzer-ID in die Session schreiben kann:
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
