const ALLOWED_EXTERNAL_HOSTS = new Set(['docs.expo.dev', 'github.com', 'www.gnu.org']);

export function isAllowedExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      url.username === '' &&
      url.password === '' &&
      (url.port === '' || url.port === '443') &&
      ALLOWED_EXTERNAL_HOSTS.has(url.hostname)
    );
  } catch {
    return false;
  }
}
