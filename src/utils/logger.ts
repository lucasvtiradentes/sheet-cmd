import chalk from 'chalk';

export class Logger {
  static error(message: string, error?: unknown): void {
    const errorText = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red(`❌ ${message}: ${errorText}`));
  }

  static success(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }

  static warning(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`));
  }

  static info(message: string): void {
    console.log(`${message}`);
  }

  static dim(message: string): void {
    console.log(chalk.dim(message));
  }

  static plain(message: string): void {
    console.log(message);
  }

  static json(data: unknown): void {
    console.log(JSON.stringify(data, null, 2));
  }

  static bold(message: string): void {
    console.log(chalk.bold(message));
  }

  static loading(message: string): void {
    console.log(`🔄 ${message}`);
  }

  static link(url: string, prefix?: string): void {
    const linkText = prefix ? `${prefix} ${url}` : url;
    console.log(chalk.dim(`🔗 ${linkText}`));
  }
}
