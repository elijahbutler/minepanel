import { ConfigService } from '@nestjs/config';
import { InstanceSettingsService } from 'src/settings/instance-settings.service';
import { SystemMonitoringService } from './system-monitoring.service';

describe('SystemMonitoringService network info', () => {
  const instanceSettings = {
    getNetwork: jest.fn(),
  };
  const service = new SystemMonitoringService(
    new ConfigService(),
    instanceSettings as unknown as InstanceSettingsService,
  );

  beforeEach(() => {
    instanceSettings.getNetwork.mockReset();
  });

  it('reads and trims instance-wide network settings', async () => {
    instanceSettings.getNetwork.mockResolvedValue({
      publicIp: ' play.example.com ',
      lanIp: ' 10.1.1.15 ',
    });

    await expect(service.getNetworkInfo()).resolves.toMatchObject({
      localIPs: ['10.1.1.15'],
      publicIP: 'play.example.com',
    });
  });

  it('omits blank public and invalid LAN addresses', async () => {
    instanceSettings.getNetwork.mockResolvedValue({
      publicIp: ' ',
      lanIp: 'not-an-ip',
    });

    await expect(service.getNetworkInfo()).resolves.toMatchObject({
      localIPs: [],
      publicIP: null,
    });
  });
});
