import User from "../models/user"
import Mutation from "./mutation"

const Query = {
  // me: (parent, args, context, info) => me,
  user: (parent, args, context, info) => User.findById(args.id),
  users: (parent, args, context, info) => User.find({})
}

const resolvers = {
  Query,
  Mutation
}

export default resolvers
