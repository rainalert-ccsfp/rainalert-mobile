const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

const ipAddress = getLocalIPAddress();
console.log('\n🌐 Network Configuration Helper');
console.log('================================');
console.log(`Your computer's IP address: ${ipAddress}`);
console.log(`API URL for mobile devices: http://${ipAddress}:5000`);
console.log('\n📝 Update your configuration:');
console.log('1. Open src/config/api.ts');
console.log('2. Replace the baseURL with:');
console.log(`   baseURL: "http://${ipAddress}:5000"`);
console.log('\n⚠️  Make sure:');
console.log('- Your mobile device is on the same WiFi network');
console.log('- Your backend server is running on port 5000');
console.log('- No firewall is blocking the connection');
console.log('\n🚀 To start the backend server:');
console.log('cd rain-alert-backend && node server.js\n'); 