# JARVIS Tamil Personal AI — Setup Guide

## இந்த project என்ன செய்கிறது?
- Mobile + desktop responsive website
- Android-ல் installable PWA (Chrome → ⋮ → Add to Home screen / Install app)
- Browser speech recognition (supported browser/device-ல் மட்டும்)
- Tamil text-to-speech (சாதனத்தில் Tamil voice இருந்தால் சிறப்பாக இயங்கும்)
- Browser localStorage-ல் local memory
- YouTube, Google Search, Maps போன்ற அனுமதிக்கப்பட்ட shortcuts
- Optional AI backend (Cloudflare Worker + Groq-compatible API)

**கவனம்:** Demo mode-ல் உண்மையான LLM இல்லை. உண்மையான AI replies பெற கீழே உள்ள optional backend அமைக்க வேண்டும். Speech recognition மற்றும் Tamil voice availability browser/device-ஐப் பொறுத்தது.

## Android mobile-லேயே உருவாக்குவது
1. ZIP-ஐ download செய்து Files app-ல் Extract செய்.
2. `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `sw.js` ஆகியவை ஒரே folder-ல் இருக்க வேண்டும்.
3. GitHub account திறந்து புதிய repository உருவாக்கு. உதாரணம்: `jarvis-tamil`.
4. GitHub repository → Add file → Upload files. ZIP-ஐ அல்ல, Extract செய்த folder-இன் உள்ளே இருக்கும் files-ஐ upload செய். `worker.js`-ஐ public frontend repo-வில் upload செய்ய வேண்டிய அவசியமில்லை; அதில் API key இல்லை என்றாலும் backend code-ஐ தனியாக வைத்துக்கொள்.
5. Commit changes செய்.
6. Repository → Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save.
7. சில நிமிடங்களுக்குப் பிறகு GitHub Pages காட்டும் URL-ஐ திற. HTTPS-ல் திறக்க வேண்டும்.
8. Android Chrome → ⋮ → **Add to Home screen** அல்லது **Install app**. இப்போது home screen-ல் JARVIS icon இருக்கும்.

## உண்மையான AI replies-ஐ இலவசமாகத் தொடங்குவது (Optional)
Free tiers, model names, rate limits மாறக்கூடும்; provider-ன் தற்போதைய விதிமுறைகளைச் சரிபார்.

1. Cloudflare account-ல் Workers & Pages திறந்து புதிய Worker உருவாக்கு.
2. `worker.js` உள்ள code-ஐ Worker editor-ல் paste செய்து Deploy செய்.
3. Worker Settings → Variables and Secrets-ல் `GROQ_API_KEY` என்ற **Secret** உருவாக்கி provider dashboard-ல் பெற்ற API key-ஐ சேர்க்கவும்.
4. விரும்பினால் `GROQ_MODEL` variable-ஆக உன் account-க்கு கிடைக்கும் model பெயரை அமைக்கவும்.
5. Worker URL-ஐ நகலெடு.
6. `app.js`-ல் முதல் பகுதியில் உள்ள `const API_BASE = "";` என்பதைக் `const API_BASE = "https://YOUR-WORKER-URL";` என்று மாற்று. `/chat` சேர்க்க வேண்டாம்.
7. `app.js`-ஐ GitHub-க்கு மீண்டும் upload செய்து commit செய்.
8. Site-ஐ திறந்து message அனுப்பிப் பரிசோதனை செய்.

### பாதுகாப்பு
- API key-ஐ `app.js`, HTML, GitHub repository அல்லது public file-ல் ஒருபோதும் எழுதாதே. Worker Secret-ல் மட்டும் வை.
- Public Worker URL-ஐ யாரும் அழைக்கக்கூடும்; production-க்கு rate limiting / authentication சேர்க்க வேண்டும். Personal prototype-க்கு மட்டுமே இந்த எளிய example.
- API provider usage free-tier-ஐத் தாண்டினால் கட்டணம் ஏற்படலாம். Billing settings மற்றும் usage limits-ஐச் சரிபார்.
- இந்த starter code-ல் browser localStorage memory உள்ளது. Browser data clear செய்தால் நினைவுகள் அழியலாம். இது encrypted cloud memory அல்ல.

## Android app control பற்றி
Web app-க்கு Android-ன் எல்லா system functions-க்கும் அனுமதி கிடையாது. இங்கே YouTube, Maps, Search போன்ற safe shortcuts மட்டுமே. Calls, SMS, contacts, background listening, device settings போன்றவற்றுக்கு native Android app, explicit permissions மற்றும் கூடுதல் development தேவைப்படும். Background-ல் எப்போதும் கேட்கும் “wake word” இந்த starter-ல் இல்லை.

## பிரச்சினை தீர்வு
- Mic வேலை செய்யவில்லை: HTTPS URL-ல் திற, Chrome site settings-ல் Microphone permission Allow செய்.
- Tamil voice இல்லை: Android Settings → Text-to-speech output-ல் Tamil voice data கிடைக்கிறதா பார்க்கவும்; இல்லையெனில் browser default voice பயன்படுத்தலாம்.
- AI பதில் இல்லை: Worker URL சரியா, `GROQ_API_KEY` secret அமைக்கப்பட்டுள்ளதா, provider model/account available-ஆ எனப் பார்க்கவும்.
- பழைய version வருகிறது: Chrome-ல் reload செய்; தேவைப்பட்டால் site data clear செய்து மீண்டும் திற.
- Offline: app shell திறக்கலாம்; AI backend மற்றும் web search-க்கு internet தேவை.

## Files
- `index.html` — UI
- `style.css` — futuristic dark theme
- `app.js` — chat, voice, memory, shortcuts
- `manifest.webmanifest` — installable app metadata
- `sw.js` — basic offline cache
- `worker.js` — optional server-side AI proxy
