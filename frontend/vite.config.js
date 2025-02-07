import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import os from 'os'

// Function to get the correct local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let localIP = '127.0.0.1'; // Default fallback

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (
        iface.family === 'IPv4' &&
        !iface.internal &&
        iface.address.startsWith('192.168.')
      ) {
        localIP = iface.address;
      }
    }
  }

  return localIP;
}

const LOCAL_IP = getLocalIP();
console.log(`Detected Local IP: ${LOCAL_IP}`);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  define: {
    'process.env.BACKEND_URL': JSON.stringify(`http://${LOCAL_IP}:8000`)
  }
})
