import pretty from '@mechanicalhuman/bunyan-pretty';
import bunyan from 'bunyan';

export const ROOT_LOGGER = bunyan.createLogger({
  name: 'app',
  stream: pretty(process.stdout, {
    timeStamps: false,
  }),
  level: 'debug',
});
