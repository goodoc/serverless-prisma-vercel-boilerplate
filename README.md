# Prisma Vercel Boilerplate

This is a Prisma Boilerplate API build for the Vercel platform. It includes:

- Build-in registration and login system
- JWT token auth
- Token refresh logic
- Graphql Shield permissions
- Cors support
- Basic endpoint testing with chai and mocha
- Automatic database seeding and reset
- Written in Typescript!

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
ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjExMDc1NDQyLCJleHAiOjE2MTE5NzU0NDJ9.mFWd0A6ZhAHVv_clkp7ijDMgxbQbJ01h_yXVjgisiIA
ALLOWED_ORIGIN=http://localhost:8080
```

`ACCESS_TOKEN` was generated with the `APP_SECRET` set as `appsecret123`. You should obviously change this in production to a secret value, but for CI you should probably keep it as that unless you also want to reset the ACCESS_TOKEN.

`DATABASE_URL` should be a connection string for your database. This API was developped with Postgres because it's extremely easy to set up a free Postgres database on Heroku, but it should work with any database.

`ALLOWED_ORIGIN` handles where requests are allowed from. Change this depending on your environment.

## Development

Starting development is easy!

- `npm i`
- `npm run dev`

Your API will be located at `http://localhost:3000/api`. You can find a collection of requests for postman [at this link](https://www.getpostman.com/collections/4302c548537e993a8a36).

## Deploying on Vercel

Types are generated on dev and build **BUT** they will break when deploying on Vercel unless you do the following:

**DELETE `package-lock.json` BEFORE DEPLOYING**

Vercel uses a cache system for both `node_modules` and your build output based on the contents of your `package-lock.json`. This means that without deleting it entirely the command to generate your types won't generate correctly.

## Testing

I've only included basic tests in this example to show how to test your Graphql queries and mutations. These are by no means meant to represent a complete testing suite but they should be enough to expand on.

The database connected to Prisma will be automatically wiped and seeded on every test run, so be careful you don't have your production database set by mistake.

## CI

The repo also includes a simple Github Action that will install, build and run your tests automatically on push.

Don't forget to add your `ACCESS_TOKEN` `APP_SECRET` and `DATABASE_URL` to your repository's secrets or the tests will fail!
