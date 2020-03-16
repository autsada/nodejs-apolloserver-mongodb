import OmiseFn from 'omise'

const omise = OmiseFn({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY
})

export const retrieveCustomer = id => {
  if (!id) return null

  return Promise((resolve, reject) => {
    omise.customers.retrieve(id, function(err, res) {
      if (res) {
        resolve(res)
      } else {
        resolve(null)
      }
    })
  })
}

export const createCustomer = (email, description, card) => {
  return new Promise((resolve, reject) => {
    omise.customers.create({ email, description, card }, function(err, res) {
      if (res) {
        resolve(res)
      } else {
        resolve(null)
      }
    })
  })
}

export const createCharge = (amount, customer) => {
  return new Promise((resolve, reject) => {
    omise.charges.create({ amount, currency: 'thb', customer }, function(
      err,
      res
    ) {
      if (res) {
        resolve(res)
      } else {
        resolve(null)
      }
    })
  })
}
