const mongoose = require("mongoose")

// Define the schema for the document

const documentSchema = new mongoose.Schema({
    _id: String,
    data: Object,
})

// Create and export the Document model

module.exports = mongoose.model("Document", documentSchema)
