const packagejson = require("../package.json")

module.exports = {
  logo: {
    alt: "https://dl.ragestudio.net/branding/comty/alt/index.svg"
  },
  
  app: {
    title: packagejson.name,
    siteName: 'Comty™',
    copyright: 'RageStudio©',

    dva_app_model: "app",
    mainPath: '/main',

    defaultStyleClass: "app_",
    defaultTransitionPreset: "moveToLeftFromRight",

    storage: { // specify where data is storaged
      session_frame: "session",
      signkey: "certified",
      settings: "settings",
      theme: "theme"
    },

    guid: "7d6b74b5-1b3b-432f-97df-2c5fc2c2b6ae",
    certified_signkeys: [
      "f706b0a535b6c2d36545c4137a0a3a26853ea8b5-1223c9ba7923152cae28e5a2e7501b2b-50600768"
    ],
    api_hostname: "https://api.comty.pw",
  },

  queryIndexer: [
    {
      match: '/s;:id',
      to: `/settings?key=:id`,
    },
    {
      match: '/h;:id',
      to: `/hashtag?key=:id`,
    },
    {
      match: '/post/:id',
      to: `/post?key=:id`,
    },
    {
      match: '/@:id',
      to: `/@/:id`,
    }
  ],

  i18n: {
    languages: [
      {
        key: 'en',
        title: 'English',
      },
    ],
    defaultLanguage: 'en',
  },

  layouts: [
    {
      name: 'primary',
      include: [/\/main/, /\/settings/, /\/saves/, /\/pro/, /\/chats/, /\//],
      exclude: [/\/publics/, /\/login/],
    },
    {
      name: 'public',
      include: [/.*/]
    }
  ],

  defaults: {
    app_model: "app",
    verbosity: false,
    sidebarCollaped: false,
    session_noexpire: false,
    search_ontype: false,
    post_autoposition: true,
    overlay_loosefocus: true,
    render_pagetransition_preset: 'moveToRightScaleUp',
    post_catchlimit: '20',
    post_hidebar: true,

    feed_autorefresh: false,
    keybinds: {
      nextElement: "J",
      prevElement: "U",
      createNew: "N"
    }
  },

  stricts: {
    post_maxlenght: '512',
    api_maxpayload: '101376', // In KB
    api_maxovertick: 10,
  }
}
