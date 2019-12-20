import express from "express"
import mongoose from "mongoose"

import server from "./server"

const DB_USER = "autsada"
const DB_PASSWORD = "DMEAXOEV7gc5JIAZ"
const DB_NAME = "ecommerce"
const PORT = 4444

const createServer = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORD}@graphql-basic-o1icg.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
      { useUnifiedTopology: true }
    )

    const app = express()

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
