export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '3d66fb33e19206b684b24f6a9ec019f6'),
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
