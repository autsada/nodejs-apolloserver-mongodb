import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  providerId: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Number,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  carts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CartItem',
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  cards: [
    {
      id: String,
      cardInfo: {
        id: String,
        expiration_month: Number,
        expiration_year: Number,
        brand: String,
        last_digits: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
})

const User = mongoose.model('User', userSchema)

export default User
