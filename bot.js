const { Telegraf } = require('telegraf')
const rateLimit = require('telegraf-ratelimit')

const request = require('request-promise')

const bot = new Telegraf(process.env.TOKEN)

const limitConfig = {
  window: 10000,
  limit: 1,
  onLimitExceeded: (ctx, next) => ctx.replyWithHTML('<b>Ошибка ☹️</b>\nЯ не могу так часто с тобой работать.\nПиши не так быстро.')
}

bot.start( ctx => {
  ctx.replyWithHTML(`<b>👋 Привет, ${ctx.from.first_name}!</b>\n\n🎵 Отправь мне ссылку на любой музыкальный релиз на площадке и я отправлю тебе ссылку на все площадки.\nПодробнее - /help\n\nРазработчик - @kirillsaint | kirillsaint.xyz\nGitHub - https://github.com/kirillsaint/musiclinksbot`)
})

bot.help(ctx => {
  ctx.replyWithHTML('<b>🎵 Отправь мне ссылку на любой музыкальный релиз на площадке и я отправлю тебе ссылку на все площадки.</b>\n\nСписок поддерживаемых площадок:\n\nspotify\nitunes\nappleMusic\nyoutube\nyoutubeMusic\ngoogle\ngoogleStore\npandora\ndeezer\ntidal\namazonStore\namazonMusic\nsoundcloud\nnapster\nyandex\nspinrilla\naudius\n\nРазработчик - @kirillsaint | kirillsaint.xyz\nGitHub - https://github.com/kirillsaint/musiclinksbot')
})

const LinksSearch = async(ctx) => {
  if (!ctx.message.text.indexOf('http') || !ctx.message.text.indexOf('https')){
    const options = {
      method: 'GET',
      uri: `https://api.song.link/v1-alpha.1/links?userCountry=RU&url=${ctx.message.text}`,
      json: true
    }
    request(options)
    .then(function (data) {
      ctx.replyWithHTML('<b>🔎 Начинаю поиск</b>').then((m) => {
        if(!data["pageUrl"]){
          ctx.replyWithHTML('<b>Ничего не найдено</b>')
        } else {
          var link = data["pageUrl"]
          try {
            var amazon = data["linksByPlatform"]['amazonMusic']['url']
          } catch {
            var amazon = 'Не найдено'
          }
          try {
            var amazonStore = data["linksByPlatform"]['amazonStore']['url']
          } catch {
            var amazonStore = 'Не найдено'
          }
          try {
            var deezer = data["linksByPlatform"]['deezer']['url']
          } catch {
            var deezer = 'Не найдено'
          }
          try {
            var appleMusic = data["linksByPlatform"]['appleMusic']['url']
          } catch {
            var appleMusic = 'Не найдено'
          }
          try {
            var soundcloud = data["linksByPlatform"]['soundcloud']['url']
          } catch {
            var soundcloud = 'Не найдено'
          }
          try {
            var spotify = data["linksByPlatform"]['spotify']['url']
          } catch {
            var spotify = 'Не найдено'
          }
          try {
            var yandex = data["linksByPlatform"]['yandex']['url']
          } catch {
            var yandex = 'Не найдено'
          }
          try {
            var youtube = data["linksByPlatform"]['youtube']['url']
          } catch {
            var youtube = 'Не найдено'
          }
          bot.telegram.deleteMessage(ctx.chat.id, m.message_id)
          ctx.replyWithHTML(`<b>Результаты поиска:</b>\n\n<b>Amazon Music</b> - ${amazon}\n<b>Amazon Store</b> - ${amazonStore}\n<b>Deezer</b> - ${deezer}\n<b>Apple Music</b> - ${appleMusic}\n<b>Soundcloud</b> - ${soundcloud}\n<b>Spotify</b> - ${spotify}\n<b>Yandex Music</b> - ${yandex}\n<b>YouTube</b> - ${youtube}\n\n<b>Смарт ссылка</b> - ${link}`)
        }
    })
    })
    .catch(function (err) {
        ctx.replyWithHTML('<b>Ничего не найдено</b>')
    })
  } else {
    ctx.replyWithHTML('<b>Я не знаю такой комманды 😥</b>')
  }
}

bot.on('text', rateLimit(limitConfig), LinksSearch)

if(process.env.TOKEN) {
  bot.launch().then(() => {
    console.log('bot start polling')
  })
} else {
  console.log("Token in .env not found.")
}
