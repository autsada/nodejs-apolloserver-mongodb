import express from "express"
import { ApolloServer } from "apollo-server-express"
import { typeDefs, resolvers } from "./schema"

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const app = express()

const PORT = 4444

server.applyMiddleware({ app })

app.listen({ port: PORT }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  )
)
