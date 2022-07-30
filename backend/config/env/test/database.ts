export default ({ env }) => ({
  connection: {
    client: 'sqlite',
    useNullAsDefault: true,
    pool: {
      min: 0,
      max: 1
    },
    connection: {
      filename: ".tmp/test.db"
    },
  },
});
