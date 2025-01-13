// Question: Comment organiser le point d'entrée de l'application ?
// Réponse: Le point d'entrée doit être organisé pour initialiser les bases de données, configurer les middlewares, monter les routes, et démarrer le serveur. Cela améliore la lisibilité, la maintenabilité et facilite le débogage.
// Question: Quelle est la meilleure façon de gérer le démarrage de l'application ?
// Réponse: Utiliser une fonction asynchrone pour gérer les connexions aux bases de données et configurer le serveur, avec une gestion appropriée des erreurs.

const express = require('express');
const config = require('./config/env');
const db = require('./config/db');
const courseRoutes = require('./routes/courseRoutes');
//const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = config.port;

async function startServer() {
  try {
    // Initialiser les connexions aux bases de données
    console.log('Connecting to MongoDB...');
    await db.connectMongo();
    console.log('MongoDB connected successfully.');

    console.log('Connecting to Redis...');
    await db.connectRedis();
    console.log('Redis connected successfully.');

    // Configurer les middlewares Express
    app.use(express.json()); // Pour parser le JSON dans les requêtes
    app.use(express.urlencoded({ extended: true })); // Pour parser les données encodées en URL

    // Monter les routes
    app.use('/api/courses', courseRoutes);
    //app.use('/api/students', studentRoutes);

    // Gérer les erreurs 404
    app.use((req, res, next) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Gestion propre de l’arrêt
process.on('SIGTERM', async () => {
  try {
    console.log('Shutting down gracefully...');
    await db.disconnectMongo();
    await db.disconnectRedis();
    console.log('All connections closed. Exiting now.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Lancer le serveur
startServer();