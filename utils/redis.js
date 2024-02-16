const { promisify } = require('util');
const redis = require('redis');

class RedisClient {
  constructor() {
    const redisConfig = {
      host: 'redis-14074.c280.us-central1-2.gce.cloud.redislabs.com',
      port: 14074,
      password: 'K60kfz2QSkeN7JovBRtnWHclq46HcETF',
    };
    this.client = redis.createClient(redisConfig);

    this.client.on('error', (err) => {
      console.error('Redis Error:', err);
    });
  }

  isAlive() {
    try {
      this.client.ping();
      return true;
    } catch (err) {
      return false;
    }
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);

    try {
      return await getAsync(key);
    } catch (error) {
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.setex(key, duration, value);
    } catch (error) {
      console.error('Redis Set Error:', error);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis Delete Error:', error);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
