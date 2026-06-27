import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        unique: true
    },
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: false
    },
    themeName: {
        type: String,
        enum: ['Dawn', 'Modern', 'Minimal', 'Vogue', 'Aura', 'Carbon', 'Nordic', 'Monolith', 'Amber', 'Cyber'],
        default: 'Dawn'
    },
    primaryColor: {
        type: String,
        default: '#2563eb'
    },
    secondaryColor: {
        type: String,
        default: '#0f172a'
    },
    accentColor: {
        type: String,
        default: '#14B8A6'
    },
    fontFamily: {
        type: String,
        default: 'Inter'
    },
    borderRadius: {
        type: String,
        default: '8px'
    },
    headerStyle: {
        type: String,
        default: 'style1'
    },
    footerStyle: {
        type: String,
        default: 'style1'
    },
    productCardStyle: {
        type: String,
        default: 'style1'
    },
    categoryColumns: {
        type: Number,
        default: 4
    },
    logo: {
        type: String,
        default: ''
    },
    favicon: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Theme = mongoose.model('Theme', themeSchema);
export default Theme;
