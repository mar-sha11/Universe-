# 🌌 UniVerse - Campus Operating System

> **Secured by Marshlytes Lab | Version 2.0 (Mobile-First Architecture)**

UniVerse is a secure, hyper-local social marketplace for Nigerian students that combines three core engines into one platform:

- **EARN (The Market)**: A freelance platform for digital (coding/design) AND physical (cleaning/repairs) gigs
- **LEARN (The Library)**: An academic hub for peer-to-peer tutoring, Q&A, and resource sharing
- **CONNECT (The Campus)**: A social network organized by "Tribes" (Interest/Location) to drive daily engagement

## 🎯 The Marshlytes Philosophy

**Trust is our currency.** Every transaction is secured by:
- ✅ Identity Verification (Student ID or .edu email)
- 🔒 Escrow Payment System
- 🛡️ Location Masking for physical gigs
- 🚨 Panic Button for emergency situations
- ⚠️ Anti-Scam keyword detection

## 🎨 Design Language: Deep Space Glassmorphism

- **Theme**: Dark mode by default with deep blue/purple gradients (Nebula style)
- **Cards**: Semi-transparent "Glass" cards with blur effects
- **Typography**: Clean, modern sans-serif (Inter/Roboto)
- **Navigation**: Floating "Dock" at the bottom with glass effect
- **Mobile-First**: Thumb-friendly buttons and touch-optimized UI

## 🚀 Tech Stack

### Frontend
- **Framework**: Vanilla HTML5, CSS3, JavaScript (Mobile-coding friendly)
- **Architecture**: Single Page Application (SPA) feel with multi-page navigation
- **PWA**: Progressive Web App with manifest and service workers
- **Design**: Glassmorphism with backdrop-filter effects

### Backend
- **Runtime**: Node.js with Express Framework
- **Database**: MongoDB Atlas (NoSQL)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt for password hashing
- **Storage**: Cloudinary (for avatars and proof of work)
- **Security**: Helmet, CORS, rate limiting

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mar-sha11/Universe-.git
   cd Universe-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `CLOUDINARY_*`: Your Cloudinary credentials
   - Other configuration as needed

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: Open `public/index.html` in your browser
   - API: http://localhost:5000
   - Health check: http://localhost:5000/api/health

## 📁 Project Structure

```
Universe-/
├── public/                  # Frontend assets
│   ├── css/
│   │   ├── main.css        # Main styles with Deep Space theme
│   │   └── glassmorphism.css  # Reusable glass components
│   ├── js/
│   │   ├── main.js         # Core app functionality
│   │   └── pwa.js          # PWA and service worker logic
│   ├── images/             # Images and icons
│   ├── index.html          # Main entry point
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Service worker for offline support
├── server/                 # Backend code
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   └── validation.js   # Input validation rules
│   ├── models/             # MongoDB schemas
│   │   ├── User.js         # User model with verification
│   │   ├── Job.js          # Job model with escrow states
│   │   ├── Tribe.js        # Tribe/community model
│   │   ├── Conversation.js # Chat with Summon Protocol
│   │   └── Transaction.js  # Escrow transaction model
│   ├── routes/
│   │   └── auth.js         # Authentication routes
│   └── utils/
│       └── auth.js         # Auth helper functions
├── server.js               # Express server entry point
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🔐 Core Features

### 1. Escrow Payment System
The escrow engine implements a state machine:
```
Deposit Pending → In Progress → Review → Completed/Disputed
```
- Funds are locked in admin wallet until work is approved
- Automatic dispute resolution workflow
- Platform fee calculation (5% with minimum)

### 2. Geolocation Engine
- Uses MongoDB `$near` queries with 2dsphere indexes
- Filters jobs by 5km radius relative to user GPS
- "Safety Mask" Protocol: Shows approximate area instead of exact address until deposit

### 3. The "Summon" Protocol (Ephemeral Chat)
- User A tags User C in a chat with User B
- User C enters as Guest with limited permissions
- Privacy Rule: Guest can only see messages from their join timestamp
- Exit Rule: Guest loses access immediately upon dismissal

### 4. Identity Verification
- **Students**: Verify via .edu email OR Student ID upload
- **External Clients**: Verify via Phone Number (OTP)
- **Marshlyte Badge**: Glowing shield icon for verified users

### 5. Anti-Scam System
- Keyword detection in chat (e.g., "WhatsApp", "Pay me outside")
- Red warning banner displayed when scam keywords detected
- Flagged messages stored for moderation

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/logout` - Logout user

### Future Endpoints (Coming Soon)
- Jobs/Gigs Management
- Tribes Management
- Messaging & Conversations
- Transactions & Escrow
- User Profile & Settings

## 🧪 Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for automatic server restarts on file changes.

### Production Mode
```bash
npm start
```

### Database Models

#### User Model
- Basic info (name, email, password)
- Verification status and method
- Location with geospatial indexing
- Marshlyte badge status
- Login attempt tracking and account locking
- Trusted contacts for panic button

#### Job Model
- Category and type (digital/physical)
- Budget and currency
- Escrow status state machine
- Location with masking for physical jobs
- Applicants and reviews
- Panic button activation tracking

#### Tribe Model
- Name, description, and type
- Members with roles
- Privacy settings
- Activity tracking
- Verification badge for official tribes

#### Conversation Model
- Direct, group, or job-related chats
- Summon Protocol support for guest users
- Message scam detection
- Read receipts

#### Transaction Model
- Escrow lifecycle management
- Payment gateway integration
- Dispute handling
- Platform fee calculation

## 🎨 UI Components

### Glass Cards
```html
<div class="glass-card">
  <!-- Content with glassmorphism effect -->
</div>
```

### Navigation Dock
Floating bottom navigation with 5 main sections:
- Home 🏠
- Tribes 🌟
- Gigs 💼
- Library 📚
- Profile 👤

### Floating Action Button (FAB)
Separate '+' button for creating new content:
- Post a Gig
- Create Post
- Start a Tribe

### Marshlyte Badge
```html
<div class="verify-badge">
  <span class="shield-icon">🛡️</span>
  <span>Verified Marshlyte</span>
</div>
```

### Scam Warning Banner
```html
<div class="scam-warning">
  Suspicious keywords detected in this conversation
</div>
```

## 📱 Progressive Web App (PWA)

UniVerse is installable as a PWA:
- Works offline with service worker caching
- Install prompt on supported devices
- App shortcuts for quick access
- Push notifications (coming soon)
- Background sync for messages (coming soon)

## 🔒 Security Features

- **Helmet.js**: Secure HTTP headers
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configured for trusted origins
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing with configurable rounds
- **Input Validation**: express-validator for all inputs
- **Account Locking**: After multiple failed login attempts

## 🤝 Contributing

This project is actively developed by Marshlytes Lab. For contributions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

Developed by **Marshlytes Lab**  
Securing student transactions, one gig at a time.

---

**Current Phase**: Phase 2 - Connecting Brain to Body  
**Status**: Backend infrastructure complete, API endpoints active, Frontend prototype ready

For questions or support, please open an issue on GitHub.