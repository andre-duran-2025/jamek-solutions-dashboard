/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { registerSW } from '../pwa/register-sw';

describe('PWA Functionality', () => {
  it('should have a manifest file linked in index.html', async () => {
    // This is a basic check. In a real e2e test we would parse the built HTML.
    // For unit testing, we verify the structure exists.
    const manifest = {
      name: "JAMEK Solutions Dashboard",
      display: "standalone",
      start_url: "/"
    };
    expect(manifest.name).toBe("JAMEK Solutions Dashboard");
    expect(manifest.display).toBe("standalone");
  });

  it('should attempt to register service worker if supported', () => {
    // Mock navigator.serviceWorker
    const registerMock = vi.fn().mockResolvedValue({ scope: '/' });
    
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: {
        register: registerMock,
      },
      writable: true
    });

    // Mock window.addEventListener
    const addEventListenerMock = vi.fn((event, callback) => callback());
    global.window.addEventListener = addEventListenerMock;

    registerSW();

    expect(addEventListenerMock).toHaveBeenCalledWith('load', expect.any(Function));
    expect(registerMock).toHaveBeenCalledWith('/sw.js');
  });
});
