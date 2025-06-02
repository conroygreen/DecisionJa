# Firebase Firestore Security Rules (Phase 3c)

Apply these rules inside your Firebase console under:
Firestore Database -> Rules

------------------------------------------------------

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

------------------------------------------------------

This fully locks down your database so that only authenticated users (created via Firebase Auth) can read/write data.

Make sure you have registered your admin users under:
Firebase Authentication -> Users