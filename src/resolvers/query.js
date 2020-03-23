import User from '../models/user'
import Product from '../models/product'

const Query = {
  user: (parent, args, { userId }, info) => {
    // Check if user logged in
    if (!userId) throw new Error('Please log in')

    return User.findById(userId)
      .populate({
        path: 'products',
        options: { sort: { createdAt: 'desc' } },
        populate: { path: 'user' }
      })
      .populate({ path: 'carts', populate: { path: 'product' } })
      .populate({
        path: 'orders',
        options: { sort: { createdAt: 'desc' } },
        populate: { path: 'items', populate: { path: 'product' } }
      })
  },
  users: (parent, args, context, info) =>
    User.find({})
      .populate({
        path: 'products',
        populate: { path: 'user' }
      })
      .populate({ path: 'carts', populate: { path: 'product' } }),
  product: (parent, args, context, info) =>
    Product.findById(args.id).populate({
      path: 'user',
      populate: { path: 'products' }
    }),
  products: (parent, args, context, info) =>
    Product.find()
      .populate({
        path: 'user',
        populate: { path: 'products' }
      })
      .sort({ createdAt: 'desc' })
}

export default Query
