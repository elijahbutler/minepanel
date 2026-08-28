import { ServerConfig } from '../dto/server-config.model';
import { BedrockServerStrategy } from './bedrock-server.strategy';

describe('BedrockServerStrategy', () => {
  const strategy = new BedrockServerStrategy();

  it('should include LEVEL_NAME when worldLevelName is configured', () => {
    const env = strategy.buildEnvironment({
      id: 'bedrock-test',
      edition: 'BEDROCK',
      serverType: 'VANILLA',
      serverName: 'Bedrock Test',
      difficulty: 'normal',
      maxPlayers: '10',
      onlineMode: true,
      gameMode: 'survival',
      viewDistance: '10',
      worldLevelName: 'world',
    } as ServerConfig);

    expect(env.LEVEL_NAME).toBe('world');
  });

  it('should keep a custom env var whose value contains an equals sign', () => {
    const env = strategy.buildEnvironment({
      id: 'bedrock-test',
      edition: 'BEDROCK',
      serverType: 'VANILLA',
      serverName: 'Bedrock Test',
      difficulty: 'normal',
      maxPlayers: '10',
      onlineMode: true,
      gameMode: 'survival',
      viewDistance: '10',
      envVars: 'SOME_FLAG=-Dfoo=bar=baz',
    } as ServerConfig);

    expect(env.SOME_FLAG).toBe('-Dfoo=bar=baz');
  });

  it('should configure the shutdown delay and custom broadcast', () => {
    const env = strategy.buildEnvironment({
      id: 'bedrock-test',
      edition: 'BEDROCK',
      serverType: 'VANILLA',
      serverName: 'Bedrock Test',
      difficulty: 'normal',
      maxPlayers: '10',
      onlineMode: true,
      gameMode: 'survival',
      viewDistance: '10',
      stopDelay: '30',
      shutdownBroadcastMessage: 'Server stopping in {seconds} seconds.',
    } as ServerConfig);

    expect(env.STOP_SERVER_ANNOUNCE_DELAY).toBe('30');
    expect(env.STOP_SERVER_ANNOUNCE).toBe('say Server stopping in 30 seconds.');
  });
});
