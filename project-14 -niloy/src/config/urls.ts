export const getRecordUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:5174/record';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5174/record';
  }
  return 'https://claritystream.vercel.app/record';
};

export const getLibraryUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:5174/library';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5174/library';
  }
  return 'https://claritystream.vercel.app/library';
};

export const getAppShareUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:5174/';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5174/';
  }
  return 'https://claritystream.vercel.app/';
};
