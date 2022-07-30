export default ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DB_HOST', ''),
      port: env.int('DB_PORT', 3306),
      database: env('DB_NAME', ''),
      user: env('DB_USERNAME', ''),
      password: env('DB_PASS', ''),
      ssl: env.bool('DB_SSL', false),
    },
  },
});
