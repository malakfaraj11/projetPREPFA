const mongoose = require('mongoose');

// Utilisateurs (Clients, Prestataires, Admin)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ['client', 'provider', 'admin'], default: 'client' },
    // Specifique Prestataire
    cin: String,
    job: String,
    price: { type: Number, default: 0 },
    description: String,
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    availability: { type: Map, of: Boolean, default: {} },
    createdAt: { type: Date, default: Date.now }
});

// Réservations
const BookingSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clientName: String,
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    providerName: String,
    providerJob: String,
    dateTime: { type: Date, required: true },
    duration: Number,
    price: Number,
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'confirmed' },
    rated: { type: Boolean, default: false },
    review: {
        rating: Number,
        comment: String,
        date: Date
    }
});

// Liste des métiers
const JobSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Booking: mongoose.model('Booking', BookingSchema),
    Job: mongoose.model('Job', JobSchema)
};