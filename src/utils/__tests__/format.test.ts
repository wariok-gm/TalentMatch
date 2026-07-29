import { daysUntil, formatCount, formatHeight, formatPay, formatRate, timeAgo } from '../format';

describe('format utils', () => {
  it('formatCount abbreviates thousands and millions', () => {
    expect(formatCount(999)).toBe('999');
    expect(formatCount(1_500)).toBe('1.5K');
    expect(formatCount(2_000)).toBe('2K');
    expect(formatCount(1_250_000)).toBe('1.3M');
  });

  it('formatRate renders an hourly rate', () => {
    expect(formatRate(150)).toBe('$150/hr');
  });

  it('formatPay renders ranges with the right unit suffix', () => {
    expect(formatPay({ payMin: 500, payMax: 1500, payUnit: 'day' })).toBe('$500–$1,500/day');
    expect(formatPay({ payMin: 1000, payMax: 3000, payUnit: 'project' })).toBe('$1,000–$3,000 total');
  });

  it('formatHeight converts cm to feet and inches', () => {
    expect(formatHeight(183)).toBe(`6'0" · 183cm`);
  });

  describe('with a frozen clock', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-07-28T12:00:00.000Z'));
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('timeAgo renders minute/hour/day/week buckets', () => {
      expect(timeAgo('2026-07-28T11:55:00.000Z')).toBe('5m');
      expect(timeAgo('2026-07-28T09:00:00.000Z')).toBe('3h');
      expect(timeAgo('2026-07-26T12:00:00.000Z')).toBe('2d');
      expect(timeAgo('2026-07-14T12:00:00.000Z')).toBe('2w');
    });

    it('daysUntil counts forward and clamps past dates to 0', () => {
      expect(daysUntil('2026-07-31T12:00:00.000Z')).toBe(3);
      expect(daysUntil('2026-07-01T12:00:00.000Z')).toBe(0);
    });
  });
});
