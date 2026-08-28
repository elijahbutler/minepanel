import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateServerConfigDto } from './server-config.model';

describe('UpdateServerConfigDto', () => {
  it.each(['', '0', '1', '60', '999999999'])('accepts the stop delay %j', async (stopDelay) => {
    const dto = plainToInstance(UpdateServerConfigDto, { stopDelay });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'stopDelay')).toBe(false);
  });

  it.each(['-1', '1.5', '1e2', '01', '1000000000'])('rejects the stop delay %j', async (stopDelay) => {
    const dto = plainToInstance(UpdateServerConfigDto, { stopDelay });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'stopDelay')).toBe(true);
  });
});
