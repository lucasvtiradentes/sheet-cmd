import * as dotenv from 'dotenv';
import * as path from 'path';

if (!process.env.CI) {
  const envFile = '.env.e2e';

  // Temporarily suppress console.log to avoid dotenv tips
  const originalLog = console.log;
  console.log = () => {};

  dotenv.config({ path: path.join(__dirname, `../../${envFile}`) });

  // Restore console.log
  console.log = originalLog;
} else {
  console.log('In CI, skipping env file loading');
}
