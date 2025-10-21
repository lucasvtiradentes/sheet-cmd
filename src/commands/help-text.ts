import { generateHelp } from '../definitions/generators/help-generator.js';

export function displayHelpText(): void {
  console.log(generateHelp());
}
