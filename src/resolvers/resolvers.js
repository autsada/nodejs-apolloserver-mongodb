import User from "../models/user"

// Fake database
// const users = [
//   {
//     id: "1",
//     name: "Somchai"
//   },
//   {
//     id: "2",
//     name: "Tom"
//   },
//   {
//     id: "3",
//     name: "Taro"
//   }
// ]

// const me = users[0]

const Query = {
  // me: (parent, args, context, info) => me,
  user: (parent, args, context, info) => User.findById(args.id),
  users: (parent, args, context, info) => User.find({})
}

const Mutation = {
  signup: (parent, args, context, info) => {
    return User.create(args)
  }
}

const resolvers = {
  Query,
  Mutation
}

export default resolvers
