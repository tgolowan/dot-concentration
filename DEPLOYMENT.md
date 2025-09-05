# Railway Deployment Guide

## Prerequisites
- Railway account (sign up at [railway.app](https://railway.app))
- Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Push to Git Repository
```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Focus Dot App"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/focus-dot-app.git

# Push to repository
git push -u origin main
```

### 2. Deploy on Railway

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or your Git provider)
   - Choose your repository

3. **Configure Deployment**
   - Railway will automatically detect the Node.js app
   - The `package.json` and `server.js` files will be used
   - No additional configuration needed

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at the provided Railway URL

### 3. Custom Domain (Optional)
- Go to your project settings
- Add a custom domain in the "Domains" section
- Follow Railway's instructions for DNS configuration

## Environment Variables
No environment variables are required for this app to run.

## Health Check
The app includes a health check endpoint at `/health` that Railway will use to monitor the service.

## File Structure
```
focus-dot-app/
├── index.html          # Main HTML file
├── style.css           # CSS styles and animations
├── script.js           # JavaScript functionality
├── server.js           # Express server
├── package.json        # Node.js dependencies
├── railway.json        # Railway configuration
├── .gitignore          # Git ignore file
└── README.md           # App documentation
```

## Troubleshooting

### Build Issues
- Ensure all files are committed to git
- Check that `package.json` has correct dependencies
- Verify Node.js version compatibility

### Runtime Issues
- Check Railway logs in the dashboard
- Ensure the app starts on the correct port (Railway provides PORT env var)
- Verify all static files are being served correctly

### Performance
- The app is lightweight and should run smoothly on Railway's free tier
- No database or external services required

## Monitoring
- Use Railway's built-in monitoring dashboard
- Check logs for any errors
- Monitor the health check endpoint

Your Focus Dot App should now be live and accessible from anywhere! 🚀
