export function getRawOptionValue(longName: string, shortName?: string): string | undefined {
  const args = process.argv.slice(2);

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === longName || (shortName && arg === shortName)) return args[index + 1];
    if (arg.startsWith(`${longName}=`)) return arg.slice(longName.length + 1);
    if (shortName && arg.startsWith(`${shortName}=`)) return arg.slice(shortName.length + 1);
  }

  return undefined;
}
