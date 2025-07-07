import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lk: resolve(__dirname, 'src/page/lk.html'),
        profile: resolve(__dirname, 'src/page/profile.html'),
        userLocations: resolve(__dirname, 'src/page/user-locations.html'),
        userReviews: resolve(__dirname, 'src/page/user-reviews.html'),
        publicLocations: resolve(__dirname, 'src/page/public-locations.html'),
        publicReviews: resolve(__dirname, 'src/page/public-reviews.html'),
        support: resolve(__dirname, 'src/page/support.html'),
        auth: resolve(__dirname, 'src/page/auth-success.html'),
        userProfile: resolve(__dirname, 'src/page/user-profile.html'),
      },
    }
  }
});
