import {
  toPence,
  toGbp,
  multiplyGbp,
  addGbp,
  subtractGbp,
  percentOfGbp,
} from '../common/utils/money.util';

describe('Money Utility', () => {
  describe('toPence', () => {
    it('should convert GBP to pence', () => {
      expect(toPence(0)).toEqual(0);
      expect(toPence(1)).toEqual(100);
      expect(toPence(20.5)).toEqual(2050);
      expect(toPence(0.1)).toEqual(10);
      expect(toPence(0.01)).toEqual(1);
    });
  });

  describe('toGbp', () => {
    it('should convert pence to GBP', () => {
      expect(toGbp(0)).toEqual(0);
      expect(toGbp(100)).toEqual(1);
      expect(toGbp(2050)).toEqual(20.5);
      expect(toGbp(10)).toEqual(0.1);
      expect(toGbp(1)).toEqual(0.01);
    });
  });

  describe('multiplyGbp', () => {
    it('should safely multiply count by per-unit GBP amount', () => {
      // The classic floating-point problem: 50 * 0.1 = 5.000000000000001 in raw JS
      expect(multiplyGbp(50, 0.1)).toEqual(5);
      expect(multiplyGbp(0, 0.1)).toEqual(0);
      expect(multiplyGbp(1, 0.1)).toEqual(0.1);
      expect(multiplyGbp(100, 0.1)).toEqual(10);
      expect(multiplyGbp(3, 0.33)).toEqual(0.99);
    });

    it('should handle large counts without drift', () => {
      expect(multiplyGbp(10000, 0.1)).toEqual(1000);
      expect(multiplyGbp(99999, 0.1)).toEqual(9999.9);
    });
  });

  describe('addGbp', () => {
    it('should safely add GBP amounts', () => {
      // Classic: 0.1 + 0.2 = 0.30000000000000004 in raw JS
      expect(addGbp(0.1, 0.2)).toEqual(0.3);
      expect(addGbp(20, 5)).toEqual(25);
      expect(addGbp(10.5, 20.25)).toEqual(30.75);
    });

    it('should handle multiple amounts', () => {
      expect(addGbp(10, 20, 30)).toEqual(60);
      expect(addGbp(0.1, 0.1, 0.1)).toEqual(0.3);
    });

    it('should handle zero', () => {
      expect(addGbp(0, 0)).toEqual(0);
      expect(addGbp(5, 0)).toEqual(5);
    });
  });

  describe('subtractGbp', () => {
    it('should safely subtract GBP amounts', () => {
      expect(subtractGbp(25, 5)).toEqual(20);
      expect(subtractGbp(0.3, 0.1)).toEqual(0.2);
      expect(subtractGbp(100, 0.1)).toEqual(99.9);
    });

    it('should handle multiple deductions', () => {
      expect(subtractGbp(100, 20, 30)).toEqual(50);
    });

    it('should handle negative results', () => {
      expect(subtractGbp(5, 10)).toEqual(-5);
    });
  });

  describe('percentOfGbp', () => {
    it('should calculate percentage of a GBP amount safely', () => {
      expect(percentOfGbp(25, 20)).toEqual(5);
      expect(percentOfGbp(100, 10)).toEqual(10);
      expect(percentOfGbp(30, 50)).toEqual(15);
      expect(percentOfGbp(0, 50)).toEqual(0);
    });

    it('should handle 100% discount', () => {
      expect(percentOfGbp(25, 100)).toEqual(25);
    });

    it('should handle 0% discount', () => {
      expect(percentOfGbp(25, 0)).toEqual(0);
    });

    it('should round to nearest penny', () => {
      // 33% of 10 = 3.30 (clean)
      expect(percentOfGbp(10, 33)).toEqual(3.3);
      // 33% of 3 = 0.99
      expect(percentOfGbp(3, 33)).toEqual(0.99);
    });
  });
});
