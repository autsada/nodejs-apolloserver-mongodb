import { GraphQLDateTime } from "graphql-iso-date"

import Query from "./query"
import Mutation from "./mutation"

const resolvers = {
  Query,
  Mutation,
  Date: GraphQLDateTime
}

export default resolvers
