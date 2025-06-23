const path = require("path");

module.exports = {
  // ... other config
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, 'src/components/ui')  // <== Customize this path
    },
    extensions: ['.js', '.jsx'],  // Optional: allow omitting file extensions
    modules: [
      path.resolve(__dirname, '../utils'),  // If you're also using utils from a parent dir
      'node_modules'
    ]
  }
};
