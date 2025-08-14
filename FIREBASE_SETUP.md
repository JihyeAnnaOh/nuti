# Firebase Setup Guide for Feedback System

## Issue
The feedback system is getting a "Missing or insufficient permissions" error when trying to submit feedback to Firebase.

## Solution

### 1. Update Firebase Security Rules

Go to your Firebase Console → Firestore Database → Rules and replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to feedback collection for all users
    match /feedback/{document} {
      allow read, write: if true;
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. Alternative: More Secure Rules (Recommended for Production)

If you want more security, use these rules instead:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to feedback collection
    match /feedback/{document} {
      allow read, write: if request.resource.data.keys().hasAll(['type', 'context', 'timestamp', 'url']);
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Deploy Rules

1. Copy the rules above
2. Go to Firebase Console → Firestore Database → Rules
3. Paste the rules
4. Click "Publish"

### 4. Verify Environment Variables

Make sure these environment variables are set in your `.env.local` file:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Test the Setup

1. Restart your Next.js development server
2. Try submitting feedback
3. Check the browser console for any errors
4. Verify feedback appears in Firebase Console → Firestore Database → feedback collection

## Fallback System

The feedback system now includes a fallback mechanism:

- **Primary**: Tries to save to Firebase
- **Fallback**: If Firebase fails, saves to browser's localStorage
- **User Notification**: Shows warning when using fallback

## Troubleshooting

### Still Getting Permission Errors?

1. **Check Project ID**: Ensure `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your Firebase project
2. **Wait for Rules**: Rules can take a few minutes to propagate
3. **Clear Browser Cache**: Clear localStorage and refresh the page
4. **Check Firebase Console**: Verify the project is active and billing is set up

### Firebase Project Not Set Up?

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Get your project configuration
5. Update your environment variables

### Local Development Issues?

The fallback system ensures feedback is always collected locally, even if Firebase is unavailable. Check the browser console for warnings about fallback usage.

## Security Considerations

- **Public Access**: The current rules allow anyone to read/write to the feedback collection
- **Data Validation**: Consider adding data validation rules for production
- **Rate Limiting**: Consider implementing rate limiting for production use
- **Authentication**: For production, consider requiring user authentication

## Production Recommendations

1. **Require Authentication**: Only allow authenticated users to submit feedback
2. **Rate Limiting**: Prevent spam submissions
3. **Data Validation**: Ensure feedback data meets your requirements
4. **Monitoring**: Set up alerts for unusual feedback patterns 