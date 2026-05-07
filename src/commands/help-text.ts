import { generateHelp } from '../definitions/generators/help-generator';

export function displayHelpText(): void {
  console.log(generateHelp());
}
