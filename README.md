# NoteHive 📚

A platform for sharing and discovering study notes across all semesters.
Built for students, by students.

## 🌐 Live Site
[notehive.site](https://notehive.site)

## ✨ Features
- 📤 Upload study notes and PYQs as PDFs
- 🔍 Search and filter notes by subject and semester
- ⬇️ Download notes for free
- ⭐ Rate and comment on notes
- 🔐 Google login authentication
- 👑 Admin panel for content moderation

## 🛠️ Tech Stack
- **Frontend:** React + Next.js + TypeScript
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js
- Firebase account

### Installation
1. Clone the repo
```bash
   git clone https://github.com/yourusername/notehive.git
   cd notehive
```

2. Install dependencies
```bash
   npm install
```

3. Create `.env.local` and add your Firebase config
```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server
```bash
   npm run dev
```

## 👨‍💻 Author
Built by Om Dwivedi