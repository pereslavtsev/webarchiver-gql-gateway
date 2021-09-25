import { registerAs } from '@nestjs/config';

export default registerAs('cdx', () => ({
  url: process.env.CDX_API_URL || 'https://web.archive.org',
}));
