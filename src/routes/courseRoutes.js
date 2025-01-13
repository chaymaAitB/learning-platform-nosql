// Question: Pourquoi séparer les routes dans différents fichiers ?
// Réponse : This promotes modularity, readability, and maintainability. Each module handles a specific set of routes, avoiding a bloated app.js file.
// Question : Comment organiser les routes de manière cohérente ?
// Réponse: Use a clear folder structure, e.g., a routes directory with files named by their purpose (e.g., courseRoutes.js).

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Routes pour les cours
router.post('/', courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;