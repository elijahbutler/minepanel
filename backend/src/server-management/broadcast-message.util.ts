const normalizeMessage = (message: string | undefined): string =>
  message?.replace(/[\r\n]+/g, ' ').trim() ?? '';

const escapeComposeInterpolation = (value: string): string => value.split('$').join('$$');

const quoteShellArgument = (value: string): string => `'${value.replaceAll("'", `'"'"'`)}'`;

const renderBroadcastCommand = (
  message: string | undefined,
  replacements: Readonly<Record<string, string>> = {},
): string | undefined => {
  let rendered = normalizeMessage(message);

  for (const [name, value] of Object.entries(replacements)) {
    rendered = rendered.replaceAll(`{${name}}`, value);
  }

  return rendered ? `say ${rendered}` : undefined;
};

export const buildBroadcastCommand = (
  message: string | undefined,
  replacements: Readonly<Record<string, string>> = {},
): string | undefined => {
  const command = renderBroadcastCommand(message, replacements);
  return command ? escapeComposeInterpolation(command) : undefined;
};

export const buildRconBroadcastScript = (message?: string): string | undefined => {
  const command = renderBroadcastCommand(message);
  if (!command) return undefined;

  return escapeComposeInterpolation(`rcon-cli ${quoteShellArgument(command)} || true`);
};
