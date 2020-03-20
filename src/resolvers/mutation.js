import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sgMail from '@sendgrid/mail'

import User from '../models/user'
import Product from '../models/product'
import CartItem from '../models/cartItem'
import {
  retrieveCustomer,
  createCustomer,
  createCharge
} from '../utils/omiseUtils'
import OrderItem from '../models/orderItem'
import Order from '../models/order'

const Mutation = {
  signup: async (parent, args, context, info) => {
    // Trim and lower case email
    const email = args.email.trim().toLowerCase()

    // Check if email already exist in database
    const currentUsers = await User.find({})
    const isEmailExist =
      currentUsers.findIndex(user => user.email === email) > -1

    if (isEmailExist) {
      throw new Error('Email already exist.')
    }

    // Validate password
    if (args.password.trim().length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    const password = await bcrypt.hash(args.password, 10)

    return User.create({ ...args, email, password })
  },
  login: async (parent, args, context, info) => {
    const { email, password } = args

    // Find user in database
    const user = await User.findOne({ email })
      .populate({
        path: 'products',
        populate: { path: 'user' }
      })
      .populate({ path: 'carts', populate: { path: 'product' } })

    if (!user) throw new Error('Email not found, please sign up.')

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) throw new Error('Invalid email or password.')

    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: '7days'
    })

    return { user, jwt: token }
  },
  requestResetPassword: async (parent, { email }, context, info) => {
    // 1. Find user in database by email
    const user = await User.findOne({ email })

    // 2. If no user found, throw error
    if (!user) throw new Error('Email not found, please sign up instead.')

    // 3. Create resetPasswordToken and resetTokenExpiry
    const resetPasswordToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000

    // 4. Update user (save reset token and token expiry)
    await User.findByIdAndUpdate(user.id, {
      resetPasswordToken,
      resetTokenExpiry
    })

    // 5. Send link for set password to user email
    sgMail.setApiKey(process.env.EMAIL_API_KEY)

    const message = {
      from: 'graphql_basic@test.com',
      to: user.email,
      subject: 'Reset password link',
      html: `
        <div>
          <p>Please click the link below to reset your password.</p> \n\n
          <a href='http://localhost:3000/signin/resetpassword?resetToken=${resetPasswordToken}' target='blank' style={{color: 'blue'}}>Click to reset your password</a>
        </div>
      `
    }

    sgMail.send(message)

    // 6. Return message to frontend
    return { message: 'Please check your email to proceed reset password.' }
  },
  resetPassword: async (parent, { password, token }, context, info) => {
    // Find user in database by reset token
    const user = await User.findOne({ resetPasswordToken: token })

    // If no user found throw error
    if (!user) throw new Error('Invalid token, cannot reset password.')

    // Check if token is expired
    const isTokenExpired = user.resetTokenExpiry < Date.now()

    // If token is expired throw error
    if (isTokenExpired) throw new Error('Invalid token, cannot reset password.')

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user in database (save new hashed password, delete reset token and token expiry time)
    await User.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetTokenExpiry: null
    })

    // return message
    return {
      message: 'You have successfully reset your password, please sign in.'
    }
  },
  createProduct: async (parent, args, { userId }, info) => {
    // const userId = "5e132cabae30211b84ad5d4f"

    // Check if user logged in
    if (!userId) throw new Error('Please log in.')

    if (!args.description || !args.price || !args.imageUrl) {
      throw new Error('Please provide all required fields.')
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
      path: 'user',
      populate: { path: 'products' }
    })
  },
  updateProduct: async (parent, args, { userId }, info) => {
    const { id, description, price, imageUrl } = args

    // TODO: Check if user logged in
    if (!userId) throw new Error('Please log in.')

    // Find product in database
    const product = await Product.findById(id)

    // TODO: Check if user is the owner of the product
    // const userId = "5e132cabae30211b84ad5d4f"

    if (userId !== product.user.toString()) {
      throw new Error('You are not authorized.')
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
    const updatedProduct = await Product.findById(id).populate({ path: 'user' })

    return updatedProduct
  },
  addToCart: async (parent, args, { userId }, info) => {
    // id --> productId
    const { id } = args

    if (!userId) throw new Error('Please log in.')

    try {
      // Find user who perform add to cart --> from logged in
      // const userId = "5e15cb313cc0bd1270a2180d"

      // Check if the new addToCart item is already in user.carts
      const user = await User.findById(userId).populate({
        path: 'carts',
        populate: { path: 'product' }
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
          .populate({ path: 'product' })
          .populate({ path: 'user' })

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
          .populate({ path: 'product' })
          .populate({ path: 'user' })

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
    if (!userId) throw new Error('Please log in.')

    // Find cart from given id
    const cart = await CartItem.findById(id)

    // TODO: user id from request --> Find user
    // const userId = "5e15cb313cc0bd1270a2180d"

    const user = await User.findById(userId)

    // Check ownership of the cart
    if (cart.user.toString() !== userId) {
      throw new Error('Not authorized.')
    }

    // Delete cart
    const deletedCart = await CartItem.findByIdAndRemove(id)

    // Update user's carts
    const updatedUserCarts = user.carts.filter(
      cartId => cartId.toString() !== deletedCart.id.toString()
    )

    await User.findByIdAndUpdate(userId, { carts: updatedUserCarts })

    return deletedCart
  },
  createOrder: async (parent, { amount, token }, { userId }, info) => {
    // Check if user logged in
    if (!userId) throw new Error('Please log in.')

    // Query user from the database
    const user = await User.findById(userId).populate({
      path: 'carts',
      populate: { path: 'product' }
    })

    // Create charge with omise
    let customer = await retrieveCustomer(user.cards[0] && user.card[0].id)

    if (!customer) {
      const newCustomer = await createCustomer(user.email, user.name, token)
      customer = newCustomer

      // update user'cards field
      const {
        id,
        expiration_month,
        expiration_year,
        brand,
        last_digits
      } = newCustomer.cards.data[0]

      user.cards[0] = {
        id: newCustomer.id,
        cardInfo: {
          id,
          expiration_month,
          expiration_year,
          brand,
          last_digits
        }
      }

      await User.findByIdAndUpdate(userId, { cards: user.cards })
    }

    const charge = await createCharge(amount, customer.id)

    if (!charge)
      throw new Error('Something went wrong with payment, please try again.')

    // Convert cartItem to OrderItem
    const convertCartToOrder = async () => {
      return Promise.all(
        user.carts.map(cart =>
          OrderItem.create({
            product: cart.product,
            quantity: cart.quantity,
            user: cart.user
          })
        )
      )
    }

    // Create order
    const orderItemArray = await convertCartToOrder()

    const order = await Order.create({
      user: userId,
      items: orderItemArray.map(orderItem => orderItem.id)
    })

    // Delete cartItem from the database
    const deleteCartItems = async () => {
      return Promise.all(
        user.carts.map(cart => CartItem.findByIdAndRemove(cart.id))
      )
    }

    await deleteCartItems()

    // Update user info in the database
    await User.findByIdAndUpdate(userId, {
      carts: [],
      orders: !user.orders ? [order.id] : [...user.orders, order.id]
    })

    // return order
    return Order.findById(order.id)
      .populate({ path: 'user' })
      .populate({ path: 'items', populate: { path: 'product' } })
  }
}

export default Mutation
