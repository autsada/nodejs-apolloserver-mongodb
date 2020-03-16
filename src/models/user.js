import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  resetPasswordToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Number
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  carts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CartItem'
    }
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  ],
  cardIds: [
    {
      type: String
    }
  ],
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now()
  }
})

const User = mongoose.model('User', userSchema)

export default User
