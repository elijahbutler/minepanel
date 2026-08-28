import { buildBroadcastCommand, buildRconBroadcastScript } from './broadcast-message.util';

describe('broadcast message helpers', () => {
  it('builds a single-line shutdown command and replaces the delay token', () => {
    const command = buildBroadcastCommand('Server shutting down in\n{seconds} seconds.', {
      seconds: '45',
    });

    expect(command).toBe('say Server shutting down in 45 seconds.');
  });

  it('escapes compose interpolation in player messages', () => {
    expect(buildBroadcastCommand('Tickets cost $5')).toBe('say Tickets cost $$5');
  });

  it('quotes backup messages as one shell argument', () => {
    expect(buildRconBroadcastScript("We're backing up $HOME")).toBe(
      `rcon-cli 'say We'"'"'re backing up $$HOME' || true`,
    );
  });

  it('omits blank messages', () => {
    expect(buildBroadcastCommand('  ')).toBeUndefined();
    expect(buildRconBroadcastScript()).toBeUndefined();
  });
});
