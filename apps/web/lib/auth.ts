import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const mailer = nodemailer.createTransport(process.env.EMAIL_SERVER);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await mailer.sendMail({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: "Sign in to Pokelytica",
          text: `Sign in by clicking this link: ${url}`,
          html: `<p>Sign in to Pokelytica by clicking this link:</p><p><a href="${url}">${url}</a></p>`,
        });
      },
    }),
  ],
});
