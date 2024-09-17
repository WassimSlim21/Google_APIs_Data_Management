module.exports = {
    apps: [
      {
        name: 'projxgsheetmigration',
        script: 'bin/www',
        instances: 'max', // or specify the number of instances
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'development', // default environment
        },
        env_production: {
          NODE_ENV: 'production',
          // Other environment variables for production
        }
      }
    ]
  };