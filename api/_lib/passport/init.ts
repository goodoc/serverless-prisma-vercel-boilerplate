import passport from "passport";
import express, { Response } from "express";
import cookieParser from "cookie-parser";
import { TwitterProfileInterface } from "./twitter";
import { sign } from "jsonwebtoken";
import { prisma } from "../context";

export interface ConvertedUserInterface {
  id: string;
  username: string;
  verified?: boolean;
  url: string;
  photo: string;
  provider: "twitter";
}

export interface BasePassportUserInterface {
  id: string;
  username: string;
  photos: {
    value: string;
  }[];
}

type UserInterface = TwitterProfileInterface;

let secret: string;
try {
  secret = process.env.APP_SECRET!;
} catch (err) {
  throw new Error(
    "Your APP_SECRET variable could not be found. Please set it in your .env file."
  );
}

const app = (module.exports = express());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(
  require("express-session")({
    secret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.get("/api/redirect", async (req, res) => {
  // @ts-ignore
  for (const [key, value] of Object.entries(req.sessionStore.sessions)) {
    // @ts-ignore
    const session = JSON.parse(value);
    // This makes sure the data we get back is the same accross different auth strategies
    const profile = parsePassportProfile(session.passport.user);

    // We find the user from our database
    let user;
    try {
      user = await prisma.user.findFirst({
        where: {
          platformId: profile.id,
          provider: "twitter",
        },
      });
    } catch (err) {
      throw Error(err);
    }

    // And issue access and refresh tokens
    issueTokens(res, { id: user!.id });

    // Don't forget to redirect to your front-end here
    res.redirect("/");
  }
});

const parsePassportProfile = (u: UserInterface): ConvertedUserInterface => {
  switch (u.provider) {
    case "twitter":
      return {
        id: u.id,
        username: u.username,
        url: u._json.url,
        photo: u.photos[0].value,
        provider: u.provider,
      };
  }
};

export async function issueTokens(res: Response, user: { id: string }) {
  const fifteenMins = 60000 * 60 * 15;
  const aMonth = 60000 * 60 * 24 * 30;

  const securedAccessToken = sign({ userId: user.id }, secret, {
    expiresIn: fifteenMins,
  });

  const securedRefreshToken = sign({ userId: user.id }, secret, {
    expiresIn: aMonth,
  });

  res.cookie("accessToken", securedAccessToken, {
    maxAge: fifteenMins,
    httpOnly: true,
  });

  res.cookie("refreshToken", securedRefreshToken, {
    maxAge: aMonth,
    httpOnly: true,
  });
}
