import User from '../models/user'
import jwt from 'jsonwebtoken'

export const facebookAuth = async (req, res) => {
  const {
    id,
    name: { givenName },
    emails: [{ value }],
  } = req.user

  try {
    // Find user in the database
    const user = await User.findOne({ providerId: id })
    let token

    if (!user) {
      // User not found --> new user --> create new user in the database
      const newUser = await User.create({
        name: givenName,
        email: value,
        password: `facebook_${id}`,
        providerId: id,
      })

      // Send cookie to frontend

      token = jwt.sign({ userId: newUser.id }, process.env.SECRET, {
        expiresIn: '7days',
      })
    } else {
      token = jwt.sign({ userId: user.id }, process.env.SECRET, {
        expiresIn: '7days',
      })
    }
    res.cookie('jwt', token)
    res.redirect('http://localhost:3000/products')
  } catch (error) {
    res.redirect('http://localhost:3000/signin')
  }
}

export const googleAuth = async (req, res) => {
  const {
    id,
    displayName,
    emails: [{ value }],
  } = req.user

  try {
    // Find user in the database
    const user = await User.findOne({ providerId: id })
    let token

    if (!user) {
      // User not found --> new user --> create new user in the database
      const newUser = await User.create({
        name: displayName,
        email: value,
        password: `google_${id}`,
        providerId: id,
      })

      // Send cookie to frontend

      token = jwt.sign({ userId: newUser.id }, process.env.SECRET, {
        expiresIn: '7days',
      })
    } else {
      token = jwt.sign({ userId: user.id }, process.env.SECRET, {
        expiresIn: '7days',
      })
    }
    res.cookie('jwt', token)
    res.redirect('http://localhost:3000/products')
  } catch (error) {
    res.redirect('http://localhost:3000/signin')
  }
}
