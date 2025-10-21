import * as dotenv from 'dotenv';
import * as path from 'path';

if (!process.env.CI) {
  const envFile = '.env.e2e';
  // @ts-expect-error - quiet option exists in newer dotenv versions
  dotenv.config({ path: path.join(__dirname, `../../${envFile}`), quiet: true });
} else {
  console.log('In CI, skipping env file loading');
}
