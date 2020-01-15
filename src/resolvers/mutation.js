import bcrypt from "bcryptjs"

import User from "../models/user"
import Product from "../models/product"
import CartItem from "../models/cartItem"

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
  },
  createProduct: async (parent, args, { userId }, info) => {
    // const userId = "5e132cabae30211b84ad5d4f"

    // Check if user logged in
    if (!userId) throw new Error("Please log in.")

    if (!args.description || !args.price || !args.imageUrl) {
      throw new Error("Please provide all required fields.")
    }

    const product = await Product.create({ ...args, user: userId })
    const user = await User.findById(userId)

    if (!user.products) {
      user.products = [product]
    } else {
      user.products.push(product)
    }

    await user.save()

    return Product.findById(product.id).populate({
      path: "user",
      populate: { path: "products" }
    })
  },
  updateProduct: async (parent, args, { userId }, info) => {
    const { id, description, price, imageUrl } = args

    // TODO: Check if user logged in
    if (!userId) throw new Error("Please log in.")

    // Find product in database
    const product = await Product.findById(id)

    // TODO: Check if user is the owner of the product
    // const userId = "5e132cabae30211b84ad5d4f"

    if (userId !== product.user.toString()) {
      throw new Error("You are not authorized.")
    }

    // Form updated information
    const updateInfo = {
      description: !!description ? description : product.description,
      price: !!price ? price : product.price,
      imageUrl: !!imageUrl ? imageUrl : product.imageUrl
    }

    // Update product in database
    await Product.findByIdAndUpdate(id, updateInfo)

    // Find the updated Product
    const updatedProduct = await Product.findById(id).populate({ path: "user" })

    return updatedProduct
  },
  addToCart: async (parent, args, { userId }, info) => {
    // id --> productId
    const { id } = args

    if (!userId) throw new Error("Please log in.")

    try {
      // Find user who perform add to cart --> from logged in
      // const userId = "5e15cb313cc0bd1270a2180d"

      // Check if the new addToCart item is already in user.carts
      const user = await User.findById(userId).populate({
        path: "carts",
        populate: { path: "product" }
      })

      const findCartItemIndex = user.carts.findIndex(
        cartItem => cartItem.product.id === id
      )

      if (findCartItemIndex > -1) {
        // A. The new addToCart item is already in cart
        // A.1 Find the cartItem and update in database
        user.carts[findCartItemIndex].quantity += 1

        await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
          quantity: user.carts[findCartItemIndex].quantity
        })

        // A.2 Find updated cartItem
        const updatedCartItem = await CartItem.findById(
          user.carts[findCartItemIndex].id
        )
          .populate({ path: "product" })
          .populate({ path: "user" })

        return updatedCartItem
      } else {
        // B. The new addToCart item is not in cart yet
        // B.1 Create new cartItem
        const cartItem = await CartItem.create({
          product: id,
          quantity: 1,
          user: userId
        })

        // B.2 find new cartItem
        const newCartItem = await CartItem.findById(cartItem.id)
          .populate({ path: "product" })
          .populate({ path: "user" })

        // B.2 Update user.carts
        await User.findByIdAndUpdate(userId, {
          carts: [...user.carts, newCartItem]
        })

        return newCartItem
      }
    } catch (error) {
      console.log(error)
    }
  },
  deleteCart: async (parent, args, { userId }, info) => {
    const { id } = args

    // TODO: Check if user logged in
    if (!userId) throw new Error("Please log in.")

    // Find cart from given id
    const cart = await CartItem.findById(id)

    // TODO: user id from request --> Find user
    // const userId = "5e15cb313cc0bd1270a2180d"

    const user = await User.findById(userId)

    // Check ownership of the cart
    if (cart.user.toString() !== userId) {
      throw new Error("Not authorized.")
    }

    // Delete cart
    const deletedCart = await CartItem.findOneAndRemove(id)

    // Update user's carts
    const updatedUserCarts = user.carts.filter(
      cartId => cartId.toString() !== deletedCart.id.toString()
    )

    await User.findByIdAndUpdate(userId, { carts: updatedUserCarts })

    return deletedCart
  }
}

export default Mutation
