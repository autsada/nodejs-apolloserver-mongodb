# NodeJs-Apollo Server-Mongodb Tutorial Project

Backend part of a full stack ecommerce web app. This backend was built in NodeJs, Graphql, and Mongodb as a database, specifically this app was built in NodeJs, Apollo-Server-Express, Mongoose, and Mongodb atlas. Its frontend is in separated repository (https://github.com/autsada/nextjs-apollo/tree/master).

### Tutorial link on youtube (in Thai)

https://www.youtube.com/playlist?list=PLCT_w0Fqe_z7o3fVVqlU9NBeByrwjwfDd

### Prerequisites

NodeJs v8+ (https://nodejs.org/en/)

### Installing

1. Clone the project
```
git clone https://github.com/autsada/nodejs-apolloserver-mongodb
```
2. Install dependencies
```
npm install
```

### Note:

In order to have this app up an running for all related parts, you need to have Mongodb Atlas account (https://www.mongodb.com/cloud/atlas), email service provider - sendgrid account (https://sendgrid.com/), and omise account (https://www.omise.co/) or you can use other payment gateways such as Stripe or Paypal

In .env file

```
DB_USER=<YOUR_MONGODB_USER>
DB_PASSWORD=<YOUR_MONGODB_PASSWORD>
DB_NAME=<YOUR_MONGODB_NAME>
PORT=4444
SECRET=<YOUR_APP_SECRET>
EMAIL_API_KEY=<SENDGRID_API_KEY>
OMISE_PUBLIC_KEY=<YOUR_OMISE_PUBLIC_KEY>
OMISE_SECRET_KEY=<YOUR_OMISE_SECRET_KEY>
```
