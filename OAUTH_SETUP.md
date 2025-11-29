# OAuth Setup Instructions

## Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a New Project** (or select existing):
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: "Aadat"
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: Aadat
     - User support email: your email
     - Developer contact: your email
     - Scopes: Add `email` and `profile`
     - Test users: Add your email for testing
   - Application type: "Web application"
   - Name: "Aadat Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/users/auth/google/callback`
   - Click "Create"

5. **Copy Credentials**:
   - Copy the "Client ID" and "Client Secret"
   - Add them to your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your_actual_client_id
     GOOGLE_CLIENT_SECRET=your_actual_client_secret
     ```

## GitHub OAuth Setup

1. **Go to GitHub Developer Settings**: https://github.com/settings/developers

2. **Create New OAuth App**:
   - Click "New OAuth App"
   - Application name: "Aadat"
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:3000/api/users/auth/github/callback`
   - Click "Register application"

3. **Generate Client Secret**:
   - After registration, click "Generate a new client secret"
   - Copy the secret immediately (it won't be shown again)

4. **Copy Credentials**:
   - Copy the "Client ID" and "Client Secret"
   - Add them to your `.env` file:
     ```
     GITHUB_CLIENT_ID=your_actual_client_id
     GITHUB_CLIENT_SECRET=your_actual_client_secret
     ```

## Production Setup

When deploying to production (e.g., Render):

1. **Update Redirect URLs**:
   - Google Console: Add `https://your-domain.com/api/users/auth/google/callback`
   - GitHub: Update callback to `https://your-domain.com/api/users/auth/github/callback`

2. **Update Environment Variables**:
   - Set `CLIENT_URL` to your production frontend URL
   - Update `GOOGLE_CALLBACK_URL` and `GITHUB_CALLBACK_URL` in env vars

3. **Update Frontend**:
   - In `Login.jsx`, update the OAuth button URLs to use the production API URL

## Testing

1. Restart your server after adding credentials
2. Go to `http://localhost:5173/login`
3. Click "Continue with Google" or "Continue with GitHub"
4. Authorize the app
5. You should be redirected back and logged in automatically

## Troubleshooting

- **"Redirect URI mismatch"**: Make sure the callback URL in your OAuth app settings exactly matches the one in your code
- **"unauthorized_client"**: Your OAuth consent screen might not be configured correctly
- **"invalid_client"**: Double-check your Client ID and Secret are correct in `.env`
- **No email from GitHub**: Some users don't have public emails. The app handles this by using a fallback email
