// Question: Pourquoi créer des services séparés ?
// Réponse: Pour centraliser et réutiliser la logique métier, faciliter la maintenance et réduire la duplication de code.

const { ObjectId } = require('mongodb');

// Fonctions utilitaires pour MongoDB
/**
 * Find a single document by its ID.
 * @param {Object} collection - MongoDB collection instance.
 * @param {string} id - Document ID to search for.
 * @returns {Promise<Object|null>} - Found document or null if not found.
 */
async function findOneById(collection, id) {
  try {
    const objectId = new ObjectId(id);
    return await collection.findOne({ _id: objectId });
  } catch (error) {
    throw new Error(`Invalid ID format: ${id}`);
  }
}

/**
 * Insert a new document into the collection.
 * @param {Object} collection - MongoDB collection instance.
 * @param {Object} document - Document to insert.
 * @returns {Promise<Object>} - Result of the insertion.
 */
async function insertOne(collection, document) {
  try {
    const result = await collection.insertOne(document);
    return result;
  } catch (error) {
    throw new Error(`Failed to insert document: ${error.message}`);
  }
}

/**
 * Update a document by its ID.
 * @param {Object} collection - MongoDB collection instance.
 * @param {string} id - Document ID to update.
 * @param {Object} updates - Updates to apply.
 * @returns {Promise<Object>} - Result of the update operation.
 */
async function updateOneById(collection, id, updates) {
  try {
    const objectId = new ObjectId(id);
    const result = await collection.updateOne({ _id: objectId }, { $set: updates });
    return result;
  } catch (error) {
    throw new Error(`Failed to update document with ID ${id}: ${error.message}`);
  }
}

/**
 * Delete a document by its ID.
 * @param {Object} collection - MongoDB collection instance.
 * @param {string} id - Document ID to delete.
 * @returns {Promise<Object>} - Result of the deletion operation.
 */
async function deleteOneById(collection, id) {
  try {
    const objectId = new ObjectId(id);
    const result = await collection.deleteOne({ _id: objectId });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete document with ID ${id}: ${error.message}`);
  }
}

// Export des services
module.exports = {
  findOneById,
  insertOne,
  updateOneById,
  deleteOneById,
};