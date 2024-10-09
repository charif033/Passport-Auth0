const express = require('express');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const session = require('express-session');
require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(session({
    secret: 'session-secret',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: '/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});


app.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}));

app.get('/callback', passport.authenticate('auth0', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/user');
});

app.get('/user', (req, res) => {
    if (!req.isAuthenticated) {
        res.redirect('/login');
    }
    res.render('user', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        const returnTo = `http://localhost:${port}/`;
        const logoutURL = `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(returnTo)}`;
        res.redirect(logoutURL);
    });
});

app.get('/', (req, res) => {
    res.render('index', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

app.listen(port, () => {
    console.log('Server started on http://localhost:3000');
});
