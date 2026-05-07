# 🚀 Full-Stack Deployment Guide (Render + Netlify)

Ye guide aapko help karegi jab aap apne MERN/Full-stack project ko deploy karenge. Isme humne aaj ki saari problems aur unke solutions likhe hain.

---

## 📂 1. Project Structure (Monorepo)
Agar aapka project ek hi GitHub repo ke andar kai sub-folders mein hai:
- Repo Root: `/`
- Backend: `project-13 -with-backend/Backend`
- Frontend: `project-13 -with-backend/Frontend`

---

## 🛠️ 2. Backend Deployment (Render.com)
- **Service Type:** Web Service
- **Root Directory:** `project-13 -with-backend/Backend`
- **Language:** Docker (ya Node)
- **Environment Variables:**
    - `MONGODB_URI`: Aapka database link.
    - `JWT_SECRET`: Security key.
    - `NODE_ENV`: **production** (Ise development rakhne par login fail ho sakta hai).
    - `CLIENT_URL`: `https://your-frontend.netlify.app` (Bina last slash ke).

### 💡 Problem Faced: Docker CMD Error
**Solution:** Dockerfile mein `CMD ["npm", "run", "dev"]` ki jagah `CMD ["npm", "start"]` hona chahiye taaki server production mode mein chale.

---

## 🌐 3. Frontend Deployment (Netlify)
- **Base directory:** `project-13 -with-backend/Frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment Variables:**
    - `VITE_API_URL`: `https://your-backend.onrender.com/api` (Aakhir mein `/api` lagana zaroori hai).

### 💡 Problem Faced: SPA 404 Error on Refresh
**Solution:** `public` folder mein `_redirects` file banayein ya root par `netlify.toml` file banayein jo saari requests ko `index.html` par bheje.

---

## ⚠️ 4. Common Errors & Solutions

### Error: 404 (Not Found) on API calls
- **Reason:** Frontend ko pata nahi tha ki backend kahan hai.
- **Fix:** `api.js` mein `baseURL` ko `import.meta.env.VITE_API_URL` se connect karein.

### Error: 401 (Unauthorized) after Login
- **Reason:** Browser cookies block kar raha tha kyunki backend `development` mode mein tha.
- **Fix:** Render dashboard par `NODE_ENV` ko `production` karein. Isse cookies `SameSite=None` aur `Secure` ho jayengi.

### Error: CORS Policy
- **Reason:** Backend ne frontend ko allow nahi kiya tha.
- **Fix:** Render mein `CLIENT_URL` ko apne Netlify link se update karein.

---

## ✅ Deployment Checklist
1. [ ] Backend Environment Variables set hain? (`NODE_ENV=production`)
2. [ ] Frontend `VITE_API_URL` backend link se connected hai?
3. [ ] `netlify.toml` file maujood hai?
4. [ ] Code GitHub par push ho gaya hai?
5. [ ] Netlify par "Trigger Deploy" kar diya hai?

---
*Happy Coding! ✨*
