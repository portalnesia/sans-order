import cronTasks from '../cron'

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('URL','http://localhost:3503'),
  proxy: env('NODE_ENV','development') === 'production',
  app: {
    keys: env.array('APP_KEYS'),
  },
  cron:{
    enabled: env('NODE_ENV','development') === 'production',
    tasks: cronTasks
  }
});
