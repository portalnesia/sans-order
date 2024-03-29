import { socketEvents } from "../src/utils/socket";

export default ({env}) => ({
  'i18n':{
    enabled: true,
  },
  'users-permissions': {
    enabled: true,
    config: {
      jwtSecret: env('JWT_SECRET',''),
      jwt: {
        expiresIn: '7d',
        issuer:'portalnesia.com',
        subject:'portalnesia_jwt'
      },
    },
  },
  io: {
    enabled: true,
    config: {
      IOServerOptions :{
        cors: { origin: env('URL','*') },
      },
      events:socketEvents
    },
  },
  upload: {
    enabled: true,
    provider: 'local',
    providerOptions: {
      sizeLimit: 1000000,
    },
    actionOptions: {}
  },
  'email-designer': {
    enabled: true,

    // ⬇︎ Add the config property
    config: {
      editor: {
        displayMode:'email',
        appearance:{
          theme:'dark'
        },
        tools: {
          heading: {
            properties: {
              text: {
                value: 'This is the new default text!',
              },
            },
          },
        },
        options: {
          features: {
            colorPicker: {
              presets: ['#2F6F4E','#2F6F4SD', '#F47373', '#697689', '#37D67A'],
            },
          },
          mergeTags: [
            {
              name:"Name",
              value:"{{name}}",
              sample:"Portalnesia"
            },
            {
                name:"Username",
                value:"{{username}}",
                sample:"portalnesia"
            },
            {
                name:"Email",
                value:"{{email}}",
                sample:"support@portalnesia.com"
            },
          ],
        }
      },
    },
  },
  comments: {
    enabled: true,
    config: {
      enabledCollections:['api::blog.blog'],
      badWords: false,
      entryLabel: {
        "*": ["Title", "title", "Name", "name", "Subject", "subject"],
        'api::blog.blog':['comments']
      },
      /*reportReasons: {
        MY_CUSTOM_REASON: "MY_CUSTOM_REASON",
      },*/
    },
  },
})