import passport from 'passport'
import app from '../..'

let secret

try {
  secret = process.env.APP_SECRET!
} catch (err) {
  throw new Error(
    'Your APP_SECRET variable could not be found. Please set it in your .env file.',
  )
}

app.use(passport.initialize())
app.use(passport.session())
app.use(
  require('express-session')({
    secret: process.env.APP_SECRET,
    resave: true,
    saveUninitialized: true,
  }),
)
