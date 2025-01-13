// Question: Quelle est la différence entre un contrôleur et une route ?
// Réponse: Une route définit l'URL et la méthode HTTP pour accéder à une fonctionnalité, tandis qu'un contrôleur contient la logique métier qui est exécutée lorsque la route est appelée.
// Question : Pourquoi séparer la logique métier des routes ?
// Réponse : Pour une meilleure organisation, réutilisation du code, et testabilité. Cela permet également de rendre le code plus clair et maintenable.

const { ObjectId } = require('mongodb');
const db = require('../config/db');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');

/**
 * Create a new course and cache it in Redis.
 * @param {Object} req - The request object containing course data in the body.
 * @param {Object} res - The response object.
 */
async function createCourse(req, res) {
  try {
    const { title, description, author } = req.body;

    if (!title || !description || !author) {
      return res.status(400).json({ message: 'Missing required fields: title, description, author' });
    }

    const newCourse = { title, description, author, createdAt: new Date() };
    const collection = db.getMongoDb().collection('courses');

    // Insert the new course into MongoDB
    const result = await collection.insertOne(newCourse);
    const createdCourse = { ...newCourse, _id: result.insertedId };

    // Cache the course in Redis
    const cacheKey = `course:${createdCourse._id}`;
    await redisService.cacheData(cacheKey, createdCourse, 3600); // Cache for 1 hour

    res.status(201).json({ message: 'Course created successfully', course: createdCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

/**
 * Get a course by ID, checking Redis cache first.
 * @param {Object} req - The request object containing the course ID in params.
 * @param {Object} res - The response object.
 */
async function getCourse(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const cacheKey = `course:${id}`;
    let course = await redisService.getCachedData(cacheKey);

    if (!course) {
      // If not in cache, fetch from MongoDB
      const collection = db.getMongoDb().collection('courses');
      course = await mongoService.findOneById(collection, id);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Cache the course in Redis
      await redisService.cacheData(cacheKey, course, 3600); // Cache for 1 hour
    }

    res.json(course);
  } catch (error) {
    console.error('Error retrieving course:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

/**
 * Delete a course by ID and clear its cache from Redis.
 * @param {Object} req - The request object containing the course ID in params.
 * @param {Object} res - The response object.
 */
async function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const collection = db.getMongoDb().collection('courses');

    // Delete the course from MongoDB
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Clear the course cache from Redis
    const cacheKey = `course:${id}`;
    await redisService.deleteCache(cacheKey);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

/**
 * Get all courses from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function getAllCourses(req, res) {
  try {
    const collection = db.getMongoDb().collection('courses');
    
    // Fetch all courses from MongoDB
    // const courses = await collection.find({}).toArray();
    const courses = await collection.find({}, { projection: { _id: 1, title: 1} }).toArray();


    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found' });
    }

    res.json(courses);
  } catch (error) {
    console.error('Error retrieving all courses:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}



// Export des contrôleurs
module.exports = {
  createCourse,
  getCourse,
  deleteCourse,
  getAllCourses
};