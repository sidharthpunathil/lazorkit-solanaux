# Deployment Guide

This guide walks you through deploying the Lazorkit Solana UX Examples to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to a GitHub repository

## Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Lazorkit Solana UX Examples"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in or create an account
   - Click "Add New..." → "Project"

2. **Import Your Repository**
   - Connect your GitHub account if not already connected
   - Select your repository (`lazorkit-solanaux`)
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `bun run build` (or `npm run build` if not using Bun)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `bun install` (or `npm install`)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following variables (or leave empty to use defaults):
     ```
     NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
     NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh
     NEXT_PUBLIC_PAYMASTER_URL=https://kora.devnet.lazorkit.com
     NEXT_PUBLIC_PAYMASTER_API_KEY= (optional, leave empty for Devnet)
     ```
   - **Note**: The defaults work for Devnet, so you can skip this step if using defaults

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   bun add -g vercel
   # or
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project settings
   - Add environment variables when prompted

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Verify Deployment

After deployment, verify everything works:

1. **Visit your live URL**: `https://your-project.vercel.app`
2. **Test wallet connection**: Click "Connect Wallet" and verify passkey authentication works
3. **Test features**: Try gasless transfers, token swaps, etc.

## Environment Variables

### Required Variables (with defaults)

These have defaults and work out of the box for Devnet:

- `NEXT_PUBLIC_RPC_URL` - Default: `https://api.devnet.solana.com`
- `NEXT_PUBLIC_PORTAL_URL` - Default: `https://portal.lazor.sh`
- `NEXT_PUBLIC_PAYMASTER_URL` - Default: `https://kora.devnet.lazorkit.com`

### Optional Variables

- `NEXT_PUBLIC_PAYMASTER_API_KEY` - Only needed if your paymaster requires authentication

### For Mainnet

If you want to deploy to mainnet, update these variables:

```
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PAYMASTER_URL=https://kora.mainnet.lazorkit.com
```

**Note**: Make sure you have mainnet paymaster access before switching.

## Troubleshooting

### Build Fails: "Buffer is not defined"

**Solution**: Make sure `buffer` is in your dependencies. It should already be there, but if not:

```bash
bun add buffer
```

### Build Fails: TypeScript Errors

**Solution**: Run type checking locally first:

```bash
bun run type-check
```

Fix any errors before deploying.

### Build Fails: Missing Dependencies

**Solution**: Make sure all dependencies are in `package.json`:

```bash
bun install
```

### Runtime Error: "WebAuthn not supported"

**Solution**: Passkeys require HTTPS. Vercel automatically provides HTTPS, so this shouldn't happen. If it does, check:
- You're accessing the site via HTTPS (not HTTP)
- Your browser supports WebAuthn (Chrome, Safari, Firefox, Edge)

### Runtime Error: RPC Rate Limiting

**Solution**: The default public RPC is rate-limited. For production, use a dedicated RPC provider:
- [Helius](https://helius.dev)
- [QuickNode](https://quicknode.com)
- [Alchemy](https://www.alchemy.com)

Update `NEXT_PUBLIC_RPC_URL` in Vercel environment variables.

## Custom Domain

To use a custom domain:

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your domain
4. Follow the DNS configuration instructions

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. To disable:

1. Go to Project Settings → Git
2. Uncheck "Automatically deploy on push"

## Preview Deployments

Every pull request gets a preview deployment automatically. This is great for testing changes before merging.

## Performance Optimization

Vercel automatically optimizes Next.js apps, but you can:

1. **Enable Edge Functions**: For faster API routes
2. **Optimize Images**: Use Next.js Image component
3. **Enable Caching**: Configure cache headers in `next.config.ts`

## Monitoring

Vercel provides built-in monitoring:

- **Analytics**: View page views and performance
- **Logs**: Check server logs in the Vercel dashboard
- **Speed Insights**: Monitor Core Web Vitals

## Security

### Environment Variables

- Never commit `.env.local` to Git
- Use Vercel's environment variables for secrets
- Rotate API keys regularly

### HTTPS

Vercel automatically provides HTTPS for all deployments. No configuration needed.

## Cost

Vercel's free tier includes:
- Unlimited deployments
- 100GB bandwidth/month
- 100 serverless function executions/day

For most projects, this is sufficient. Upgrade to Pro ($20/month) for:
- More bandwidth
- More function executions
- Team collaboration features

## Next Steps

After deployment:

1. **Share your live demo**: Add the URL to your README
2. **Test all features**: Make sure everything works in production
3. **Monitor performance**: Check Vercel analytics
4. **Update documentation**: Add the live demo URL to your bounty submission

## Support

If you encounter issues:

1. Check Vercel's [documentation](https://vercel.com/docs)
2. Check the [Next.js deployment guide](https://nextjs.org/docs/deployment)
3. Join the [Lazorkit Telegram](https://t.me/lazorkit) for help

---

**Your app is now live!** 🎉

Share your deployment URL in your bounty submission to demonstrate the working example.

