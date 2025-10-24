# Dependency Installation Guide

This guide helps you install all project dependencies successfully.

## ⚠️ Common Issue: npm Dependency Resolution

If you're experiencing errors like `"Invalid dependency type requested: alias"`, this is due to an older npm version (6.x).

## ✅ Solution 1: Use the Setup Script (Recommended for Windows)

```powershell
.\setup.ps1
```

This script will:
1. Check and upgrade npm automatically
2. Install dependencies in stages
3. Handle common installation issues

## ✅ Solution 2: Manual Step-by-Step Installation

### Step 1: Upgrade npm

```bash
# Windows (PowerShell as Administrator)
npm install -g npm@latest

# Verify new version
npm --version  # Should be 8.x or higher
```

### Step 2: Clean npm Cache

```bash
npm cache clean --force
```

### Step 3: Install Core Dependencies

```bash
# Install Next.js and React first
npm install next@14 react@18 react-dom@18

# Verify installation
npm list next react react-dom
```

### Step 4: Install Development Tools

```bash
npm install --save-dev typescript @types/react @types/node @types/react-dom
```

### Step 5: Install Tailwind CSS

```bash
npm install --save-dev tailwindcss postcss autoprefixer
```

### Step 6: Install Backend Dependencies

```bash
npm install express cors dotenv pg bcryptjs jsonwebtoken zod axios recharts date-fns nodemailer node-cron
```

### Step 7: Install Backend Type Definitions

```bash
npm install --save-dev @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/nodemailer @types/node-cron
```

### Step 8: Install ESLint

```bash
npm install --save-dev eslint eslint-config-next
```

## ✅ Solution 3: Alternative Installation Methods

### Method A: Use --legacy-peer-deps

```bash
npm install --legacy-peer-deps
```

This flag tells npm to ignore peer dependency conflicts (safe for this project).

### Method B: Use Yarn Instead

If npm continues to have issues:

```bash
# Install Yarn globally
npm install -g yarn

# Install dependencies with Yarn
yarn install
```

Then update package.json scripts to use yarn:
```json
"scripts": {
  "dev": "yarn next dev",
  "build": "yarn next build",
  "start": "yarn next start"
}
```

### Method C: Use pnpm

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies with pnpm
pnpm install
```

## 🔍 Verify Installation

After installation, verify all key packages are installed:

```bash
# Check package.json dependencies
npm list --depth=0

# Verify specific packages
npm list next react typescript tailwindcss express pg
```

Expected output should show:
```
├── next@14.x.x
├── react@18.x.x
├── typescript@5.x.x
├── tailwindcss@3.x.x
├── express@4.x.x
└── pg@8.x.x
```

## 📦 Package Versions

The project uses these major versions:

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.x | Frontend framework |
| react | 18.x | UI library |
| typescript | 5.x | Type safety |
| tailwindcss | 3.x | Styling |
| express | 4.x | Backend framework |
| pg | 8.x | PostgreSQL client |
| bcryptjs | 2.4.x | Password hashing |
| jsonwebtoken | 9.x | JWT authentication |
| recharts | 2.9.x | Charts |
| zod | 3.22.x | Validation |

## 🐛 Troubleshooting Installation Issues

### Issue: "Cannot find module 'next'"

**Solution:**
```bash
npm install next@14 --save
```

### Issue: "Module not found: Can't resolve 'react'"

**Solution:**
```bash
npm install react@18 react-dom@18 --save
```

### Issue: "TypeScript errors everywhere"

**Solution:**
```bash
npm install --save-dev typescript @types/react @types/node
```

### Issue: "Peer dependency warnings"

**Solution:** These are warnings, not errors. The app will work. To suppress:
```bash
npm install --legacy-peer-deps
```

### Issue: "EACCES permission errors" (Linux/Mac)

**Solution:**
```bash
sudo npm install -g npm@latest
# Or use nvm (Node Version Manager) to avoid sudo
```

### Issue: "Network timeout errors"

**Solution:**
```bash
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

### Issue: "Disk space errors"

**Solution:**
```bash
# Clean npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install
```

## 🎯 Post-Installation Steps

After successful installation:

### 1. Verify TypeScript Configuration
```bash
npx tsc --version
```

### 2. Check Next.js Setup
```bash
npx next info
```

### 3. Test Development Server
```bash
npm run dev
```

Should start without errors on http://localhost:3000

### 4. Verify Backend Dependencies
```bash
node -e "console.log(require('express')); console.log(require('pg'));"
```

Should output function definitions, not errors.

## 📝 Manual Dependency Installation List

If you prefer to install packages one by one:

### Core (Required)
```bash
npm install next react react-dom
```

### TypeScript (Required)
```bash
npm install --save-dev typescript @types/react @types/node @types/react-dom
```

### Styling (Required)
```bash
npm install --save-dev tailwindcss postcss autoprefixer
```

### Backend Core (Required)
```bash
npm install express cors dotenv
```

### Database (Required)
```bash
npm install pg
```

### Authentication (Required)
```bash
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### Utilities (Required)
```bash
npm install axios zod date-fns
```

### Charts (Required)
```bash
npm install recharts
```

### Email (Optional)
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Cron Jobs (Required)
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

### Linting (Optional but Recommended)
```bash
npm install --save-dev eslint eslint-config-next
```

## 🚀 Quick Test

After installation, test that everything works:

```bash
# Create a test file
echo 'export default function Test() { return <div>Test</div> }' > app/test.tsx

# Try to build
npm run build

# If successful, clean up
rm app/test.tsx
```

## 📊 Installation Checklist

- [ ] npm version 7+ installed
- [ ] Node.js 18+ installed
- [ ] npm cache cleaned
- [ ] Core packages (next, react, react-dom) installed
- [ ] TypeScript and types installed
- [ ] Tailwind CSS installed
- [ ] Backend packages installed
- [ ] No error messages during installation
- [ ] `npm run dev` starts successfully
- [ ] TypeScript compiles without errors

## 💡 Pro Tips

1. **Always use the same package manager** - Don't mix npm, yarn, and pnpm
2. **Commit package-lock.json** - Ensures consistent installs across environments
3. **Use .nvmrc** - Pin Node.js version for team consistency
4. **CI/CD caching** - Cache node_modules to speed up deployments
5. **Regular updates** - Run `npm outdated` periodically to check for updates

## 🆘 Still Having Issues?

If you've tried everything and still can't install dependencies:

1. **Check your Node.js version:**
   ```bash
   node --version
   ```
   Should be v18 or higher

2. **Try a clean install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

3. **Check for system issues:**
   - Antivirus blocking npm
   - Firewall blocking downloads
   - Proxy settings
   - Disk space

4. **Use a different network:**
   - Corporate proxies can block npm
   - Try mobile hotspot or home network

5. **Check npm logs:**
   ```bash
   npm install --verbose
   ```

## 📞 Getting Help

If installation continues to fail:

1. Check the error message carefully
2. Search the error on Stack Overflow
3. Check npm's official troubleshooting guide
4. Review GitHub issues for the specific package
5. Try installing packages individually to identify the problematic one

---

**Once installed successfully, you're ready to start developing! 🎉**

Proceed to `QUICKSTART.md` for next steps.
