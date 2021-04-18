# Prisma Vercel Boilerplate

This is a Prisma Boilerplate API build for the Vercel platform. It includes:

- Built-in registration and login system
- JWT token auth
- Token refresh logic
- Graphql Shield permissions
- Cors support
- Basic endpoint testing with chai and mocha
- Automatic database seeding and reset
- Twitter login with Passport.js
- Written in Typescript!

This boilerplate is build with [Prisma](https://www.prisma.io/) and [Express](https://expressjs.com/). Express is largely used to support [Passport.js](http://www.passportjs.org/) login.

I made this repo to create a quick foundation to build serverless GraphQL APIs on the Vercel platform as I initially found it quite hard to get started because of some quirks from both Vercel and Prisma.

The implementation is solid and I've been using this repo in production on a couple of projects, but it is in no way perfect or flawless. Please report any bugs that you find and feel free to contribute!

## Set up Postgres

To set up Postgres we'll use one of Prisma's preview features. I wouldn't recommend this in production, but this is just our initial development sync so it should be just fine.

```
npx prisma db push --preview-feature
```

## Environment variables

The API depends on three environment variables. These can be set locally by creating a `.env` file in the root of the project or by setting them in your Vercel project settings.

```
DATABASE_URL=postgres://username:password@address:5432/databasename
APP_SECRET=appsecret123
ALLOWED_ORIGIN=http://localhost:8080
```

`ACCESS_TOKEN` was generated with the `APP_SECRET` set as `appsecret123`. You should obviously change this in production to a secret value, but for CI you should probably keep it as that unless you also want to reset the ACCESS_TOKEN.

`DATABASE_URL` should be a connection string for your database. This API was developped with Postgres because it's extremely easy to set up a free Postgres database on Heroku, but it should work with any database.

`ALLOWED_ORIGIN` handles where requests are allowed from. Change this depending on your environment. This can be an array!

## Development

Starting development is easy!

- `npm i`
- `npm run vercel:dev`

Your API will be located at `http://localhost:3000/api`. You can find a collection of requests for postman [at this link](https://www.getpostman.com/collections/4302c548537e993a8a36).

## Deploying on Vercel

Types are generated on dev and build **BUT** they will break when deploying on Vercel unless you keep the `postinstall` script in your `package.json`. This will force types to be regenerated after each install.

## Twitter login

Twitter login has been implemented with Passport.js, you can find more about the [twitter-strategy on the Passport.js docs](http://www.passportjs.org/packages/passport-twitter/).

The twitter strategy will only be initialised if the following environment variables are added to `.env`:

```
TWITTER_CONSUMER_KEY
TWITTER_CONSUMER_SECRET
```

In addition the Twitter strategy uses the Vercel environment variable `VERCEL_URL` for building the callback url.

Once these are set you can visit http://localhost:3000/api/auth/twitter and the login process will start. The user's Twitter info will be automatically written to the database once the process is complete and access tokens will be issued for the account.

At the moment failure and success redirect to other API pages. Make sure you edit the [`failureRedirect`](https://github.com/coloredcat/serverless-prisma-vercel-boilerplate/blob/master/api/passport/twitter.ts#L107) and [`successRedirect`](<[`failureRedirect`](https://github.com/coloredcat/serverless-prisma-vercel-boilerplate/blob/master/api/passport/init.ts#L76)>) to redirect to your front-end!

## Testing

I've only included basic tests in this example to show how to test your Graphql queries and mutations. These are by no means meant to represent a complete testing suite but they should be enough to expand on.

The database connected to Prisma will be automatically wiped and seeded on every test run, so be careful you don't have your production database set by mistake.

## CI

The repo also includes a simple Github Action that will install, build and run your tests automatically on push.

Don't forget to add your `ACCESS_TOKEN` `APP_SECRET` and `DATABASE_URL` to your repository's secrets or the tests will fail!
