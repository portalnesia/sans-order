export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', ''),
    options:{
      expiresIn: '7d',
      issuer:'portalnesia.com'
    }
  },
  url:`${env("WEB_URL")}/sansorder-admin`,
  forgotPassword: {
    from: 'no-reply@portalnesia.com',
    replyTo: 'support@portalnesia.com',
  }
});
