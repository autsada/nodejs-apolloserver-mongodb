import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
import passport from 'passport'

import server from './server'
import { facebookPassportConfig, googlePassportConfig } from './utils/passport'
import { facebookAuth, googleAuth } from './utils/socialProvidersAuth'

const { DB_USER, DB_PASSWORD, DB_NAME, PORT } = process.env

facebookPassportConfig()
googlePassportConfig()

const createServer = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORD}@graphql-basic-o1icg.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
      { useUnifiedTopology: true }
    )

    const app = express()

    app.get('/auth/facebook', passport.authenticate('facebook'))

    app.get(
      '/auth/facebook/callback',
      passport.authenticate('facebook', {
        session: false,
        failureRedirect: 'http://localhost:3000/signin',
      }),
      facebookAuth
    )

    app.get(
      '/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    )

    app.get(
      '/auth/google/callback',
      passport.authenticate('google', {
        session: false,
        failureRedirect: 'http://localhost:3000/signin',
      }),
      googleAuth
    )

    server.applyMiddleware({ app })

    app.listen({ port: PORT }, () =>
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      )
    )
  } catch (error) {
    console.log(error)
  }
}

createServer()
