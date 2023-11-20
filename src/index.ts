/*

===
🌠 Originalmente feito para o bot Buyzil#6524 (1132724441466536017)
=====
☣ By Infinite Community & joaokristani#0000 (https://discord.gg/infinite-community-1014921352500756500)
========

*/


import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import { createCanvas } from 'canvas';
import * as config from './config.json';
const { token, channel2, role2 } = config;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const captchauser = new Set();
let captchausercount2 = 0;
let messagetimeout: NodeJS.Timeout | null = null;

client.on('ready', () => {
  console.log(`Logado com sucesso no bot "${client.user?.tag}"`);
});

client.on('messageCreate', async (message) => {

  if (message.content.toLowerCase() === '!captcha') {
    if (message.channel.id !== channel2) return;

    captchausercount2++;

    let guildmember = message.member;
    const rolecheck = guildmember?.guild.roles.cache.find(role => role.id === role2);

    if (rolecheck && guildmember?.roles.cache.has(rolecheck.id)) {
      message.reply('<:no:1171390063335194624> Você já tem o cargo; não precisa fazer o captcha novamente');
      captchausercount2--;
      return;
    }

    if (captchauser.has(message.author.id)) {
      message.reply('<:no:1171390063335194624> Você precisa terminar o captcha anterior para utilizar `!captcha` novamente');
      captchausercount2--;
      return;
    }

    captchauser.add(message.author.id);

    const canvas = createCanvas(200, 100);
    const ctx = canvas.getContext('2d');
    const textcap = randtext();
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(textcap, canvas.width / 2, canvas.height / 2);
    ctx.fillText(textcap, canvas.width / 2, canvas.height / 2);
    ctx.strokeStyle = '#fff';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height
      );
      ctx.stroke();
    }
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 2, 2);
    }

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'captcha.png' });
    await message.channel.send({
      files: [attachment],
      content: 'Você tem **15 Segundos** para responder\nDigite as letras da imagem abaixo:\n',
    }).catch(error => {console.error});

    const filter = (response: { author: { id: string; }; }) => {
      return response.author.id === message.author.id;
    };

    try {
      const usere = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ['time'],
      });
    
      const entertext = usere.first()?.content.toLowerCase();
    
      if (entertext === textcap.toLowerCase()) {
        const roleadd = guildmember?.guild.roles.cache.find((role) => role.id === role2);
        if (roleadd) {
          await guildmember?.roles.add(roleadd);
          message.reply('<:yes:1171390048608989234> Sucesso! O Cargo foi adicionado');
        } else {
          throw new Error('<:no:1171390063335194624> Cargo não encontrado');
        }
      } else {
        message.reply('<:no:1171390063335194624> O captcha está incorreto');
      }
    } catch (err) {
      if ((err as Error).message === undefined) {
        message.reply('<:no:1171390063335194624> Você demorou demais para responder o captcha')
      } else {
        message.reply(`<:no:1171390063335194624> Aconteceu um erro crítico`);
        console.error('Erro ao adicionar cargo:', (err as Error).message);
      }
    } finally {
      captchauser.delete(message.author.id);
    
      if (captchausercount2 >= 2 && !messagetimeout) {
        messagetimeout = setTimeout(() => {
          message.channel.send('<:870764844012412938:1171389557711835207> **Em testes**\n<:reply:1171390418756321350> Utilize `!captcha` para ganhar o cargo Desbloqueado');
          captchausercount2 = 0;
          messagetimeout = null;
        }, 300000);
      }
    }
  }
});

function randtext() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789@'; //L minusculo e 0 foram retirados por causa do bold
  let text = '';

  for (let i = 0; i < 6; i++) {
    const rndtxt = Math.floor(Math.random() * characters.length);
    text += characters.charAt(rndtxt);
  }

  return text;
}

client.login(token);
