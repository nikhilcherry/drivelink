# DriveLink - GitHub Setup & Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `drivelink`
3. Description: `DriveLink - Next-generation V2V Communication Operating System`
4. Make it **Public** (required for free Vercel deployment)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

## Step 2: Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
cd c:\Users\Nikhi\OneDrive\Desktop\file\drivelink
git branch -M main
git remote add origin https://github.com/nikhilcherry/drivelink.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)
```bash
npm install -g vercel
vercel login
vercel
```

### Option B: Using Vercel Dashboard
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New Project**
4. Import `nikhilcherry/drivelink`
5. Framework Preset: **Vite**
6. Click **Deploy**

Your site will be live at: `https://drivelink.vercel.app` (or similar)

## Project Details

- **Framework**: React + TypeScript (Vite)
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Build Commands (for reference)
- Development: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
