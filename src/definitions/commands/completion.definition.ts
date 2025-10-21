import { APP_INFO } from '../../config/constants.js';
import { type Command, CommandNames, SubCommandNames } from '../types.js';

export const completionCommandDefinition: Command = {
  name: CommandNames.COMPLETION,
  description: 'Generate shell completion scripts',
  subcommands: [
    {
      name: SubCommandNames.COMPLETION_INSTALL,
      description: 'Install shell completion for your current shell',
      examples: [`${APP_INFO.name} completion install`]
    }
  ]
};
