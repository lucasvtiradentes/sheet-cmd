import { APP_INFO } from '../../config/constants.js';
import { type Command, CommandNames } from '../types.js';

export const updateCommandDefinition: Command = {
  name: CommandNames.UPDATE,
  description: 'Update sheet-cmd to latest version',
  examples: [`${APP_INFO.name} update`]
};
