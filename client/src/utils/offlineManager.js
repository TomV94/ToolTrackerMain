const OFFLINE_DATA_KEY = 'offline-data';

export const offlineManager = {
  async storeOfflineData(data) {
    try {
      const offlineData = await this.getOfflineData();
      offlineData.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...data
      });
      
      await caches.open('tool-tracker-v1')
        .then(cache => cache.put(OFFLINE_DATA_KEY, new Response(JSON.stringify(offlineData))));
      
      // Request sync when online
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        await navigator.serviceWorker.ready;
        await navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_REQUEST',
          tag: 'sync-tool-data'
        });
      }
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  },

  async getOfflineData() {
    try {
      const cache = await caches.open('tool-tracker-v1');
      const response = await cache.match(OFFLINE_DATA_KEY);
      return response ? await response.json() : [];
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return [];
    }
  },

  async clearOfflineData() {
    try {
      const cache = await caches.open('tool-tracker-v1');
      await cache.delete(OFFLINE_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }
}; 