import { describe, expect, it } from 'vitest';
import { extractApiErrorMessage } from '@/lib/api-errors';

describe('extractApiErrorMessage', () => {
  it('prefers nested DRF validation details from wrapped API errors', () => {
    const message = extractApiErrorMessage(
      {
        success: false,
        error: {
          status_code: 400,
          message: 'Bad Request - Invalid data provided',
          details: {
            username: ['A user with that username already exists.'],
          },
        },
      },
      'fallback'
    );

    expect(message).toBe('A user with that username already exists.');
  });

  it('falls back to top-level detail for auth errors', () => {
    const message = extractApiErrorMessage(
      {
        detail: 'No active account found with the given credentials',
      },
      'fallback'
    );

    expect(message).toBe('No active account found with the given credentials');
  });
});
