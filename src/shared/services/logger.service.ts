import { Injectable, LoggerService } from '@nestjs/common';
import { ROOT_LOGGER } from '../utils/logger.util';

@Injectable()
export class Logger implements LoggerService {
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    ROOT_LOGGER.info(message, ...optionalParams);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    ROOT_LOGGER.error(message, ...optionalParams);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    ROOT_LOGGER.warn(message, ...optionalParams);
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]) {
    ROOT_LOGGER.debug(message, ...optionalParams);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]) {
    ROOT_LOGGER.info(message, ...optionalParams);
  }
}
