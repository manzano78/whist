const MOBILE_REGEXP = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|webOS|Opera Mini|IEMobile/i;

export function isMobileUserAgent(userAgent: string | null): boolean {
  return userAgent !== null && MOBILE_REGEXP.test(userAgent);
}
