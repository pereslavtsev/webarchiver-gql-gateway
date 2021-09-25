import { registerAs } from '@nestjs/config';

export default registerAs('mwn', () => ({
  username: process.env.BOT_USERNAME,
  password: process.env.BOT_PASSWORD,
}));
