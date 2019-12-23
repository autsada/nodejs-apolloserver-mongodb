import bcrypt from "bcryptjs"

import User from "../models/user"

const Mutation = {
  signup: async (parent, args, context, info) => {
    // Trim and lower case email
    const email = args.email.trim().toLowerCase()

    // Check if email already exist in database
    const currentUsers = await User.find({})
    const isEmailExist =
      currentUsers.findIndex(user => user.email === email) > -1

    if (isEmailExist) {
      throw new Error("Email already exist.")
    }

    // Validate password
    if (args.password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters.")
    }

    const password = await bcrypt.hash(args.password, 10)

    return User.create({ ...args, email, password })
  }
}

export default Mutation
