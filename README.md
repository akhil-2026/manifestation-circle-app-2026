# Manifestation Circle 🌙

A private MERN stack web application for 4 friends to practice daily night-time mirror manifestations and track consistency.

## 🎨 Design & Branding

### Custom Favicon
The app features a custom-designed favicon that perfectly captures the manifestation theme:
- 🌙 **Crescent Moon**: Represents night-time practice and lunar energy
- ⭐ **Stars**: Symbolize dreams, wishes, and manifestation
- 🟣 **Purple Gradient**: Calming, spiritual colors for meditation
- ✨ **Sparkles**: Magic and transformation energy
- 🌌 **Constellation**: Connection between circle members

The favicon is available in multiple formats:
- `favicon.svg` - Modern SVG format with gradients and effects
- `apple-touch-icon.png` - For iOS devices
- `manifest.json` - PWA support for mobile installation

## ✨ Features

- 🪞 **Mirror Mode**: Fullscreen dark UI with auto-scrolling affirmations (6s intervals)
- 📆 **Daily Tracking**: Personal calendars with streak tracking
- 🔥 **Streak System**: Current and longest streak tracking with consistency percentage
- 👥 **Group Dashboard**: Motivational group view (no shaming, positive vibes only)
- 🧵 **Manifestation Thread**: Admin-posted weekly/monthly intentions
- 🔐 **Private Access**: Invite-only for maximum 4 users
- 🌙 **Dark Mode**: Calming dark theme throughout
- 📱 **Mobile Responsive**: Works perfectly on all devices

## 🛠 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS (dark theme)
- Axios for API calls
- React Router for navigation
- Context API for state management
- Lucide React for icons

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication (access tokens)
- Role-based access control (admin/member)
- Rate limiting & security middleware

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd manifestation-circle

# Install all dependencies
npm run install-all
```

### 2. Environment Setup

**Server Environment (.env in /server folder):**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/manifestation-circle
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

**Client Environment (.env in /client folder):**
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup
```bash
# Seed default affirmations (optional)
npm run seed
```

### 4. Run the Application
```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client  
cd client && npm run dev
```

Visit: http://localhost:5173

## 📱 How to Use

### First Time Setup
1. **Register**: First user becomes admin automatically
2. **Invite Friends**: Share registration link (max 4 total users)
3. **Start Manifesting**: Use Mirror Mode each night

### Daily Practice
1. **Evening Routine**: Click "Start Mirror Mode" on dashboard
2. **Mirror Mode**: 8 affirmations auto-scroll (6 seconds each)
3. **Mark Complete**: Click the completion button after last affirmation
4. **Track Progress**: View your calendar and streaks

### Admin Features
- Edit manifestation thread messages
- View all member statistics
- Manage affirmations (future feature)

## 🎯 Core Affirmations

1. I am very beautiful.
2. I am healthy and full of energy.
3. I am wealthy and financially abundant.
4. Thank you for giving me a high-paying job that I love.
5. Thank you for keeping my family healthy and safe.
6. Thank you for keeping my friends healthy and happy.
7. I do not hate anyone, and I release all grudges peacefully.
8. I am mentally calm, peaceful, and balanced.

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy /client/dist folder to Vercel
```

### Backend (Render/Railway)
```bash
# Deploy /server folder
# Set environment variables in platform
```

### Database (MongoDB Atlas)
- Create free cluster
- Whitelist deployment IPs
- Update connection string

## 📁 Project Structure

```
manifestation-circle/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── App.jsx         # Main app component
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route handlers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation
│   ├── utils/             # Helper functions
│   └── server.js          # Express server
└── package.json           # Root package.json
```

## 🔒 Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Protected routes (frontend & backend)

## 🎨 UI/UX Principles

- **Dark Mode Only**: Calming night-time aesthetic
- **Minimal Design**: Clean, distraction-free interface
- **Smooth Animations**: Gentle transitions and fades
- **Mobile First**: Responsive design for all devices
- **Positive Language**: No shaming, only encouragement
- **Accessibility**: Proper contrast and keyboard navigation

## 🤝 Contributing

This is a private project for personal use. If you want to adapt it:

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Private project for personal use among friends.

---

**"What you repeat daily becomes your reality." 🌙✨**