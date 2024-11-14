import 'dotenv/config';

export default ({ config }:any) => ({
  ...config,
  extra: {
    skipAuth: process.env.SKIP_AUTH === 'true'
  },
    "plugins": [
      "expo-secure-store"
    ]
  
});