describe('DevotionalService', () => {
  it('should be defined', () => {
    const { DevotionalService } = require('../services/devotional.service');
    expect(DevotionalService).toBeDefined();
  });

  it('should have getPlans method', () => {
    const { DevotionalService } = require('../services/devotional.service');
    expect(typeof DevotionalService.getPlans).toBe('function');
  });

  it('should have getBooks method', () => {
    const { DevotionalService } = require('../services/devotional.service');
    expect(typeof DevotionalService.getBooks).toBe('function');
  });

  it('should have getChapters method', () => {
    const { DevotionalService } = require('../services/devotional.service');
    expect(typeof DevotionalService.getChapters).toBe('function');
  });
});