/*
 JARVIS Tamil starter.
 Optional AI backend: deploy worker.js and set API_BASE below.
 Without backend, built-in demo replies, browser speech recognition, TTS, local memory and shortcuts still work.
*/
const API_BASE = "https://jarvis-tamil.nasarmohamedrisni.workers.dev";"
const $ = (id) => document.getElementById(id);
const messagesEl = $("messages");
const input = $("messageInput");
const voiceButton = $("voiceButton");
let recognition = null;
let isListening = false;
let toastTimer;

const memoryKey = "jarvisTamilMemory_v1";
const historyKey = "jarvisTamilHistory_v1";
const memories = JSON.parse(localStorage.getItem(memoryKey) || "[]");
let chatHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");

function toast(text) {
  const el = $("toast"); el.textContent = text; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
function setStatus(text) { $("statusText").textContent = text; }
function addMessage(role, text, save = true) {
  const article = document.createElement("article");
  article.className = "message " + (role === "user" ? "user" : "assistant");
  const avatar = document.createElement("div"); avatar.className = "avatar"; avatar.textContent = role === "user" ? "நீ" : "J";
  const bubble = document.createElement("div"); bubble.className = "bubble";
  const speaker = document.createElement("div"); speaker.className = "speaker"; speaker.textContent = role === "user" ? "நீ" : "JARVIS";
  const p = document.createElement("p"); p.textContent = text;
  bubble.append(speaker, p); article.append(avatar, bubble); messagesEl.append(article);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  if (save) {
    chatHistory.push({role: role === "user" ? "user" : "assistant", content: text});
    chatHistory = chatHistory.slice(-24);
    localStorage.setItem(historyKey, JSON.stringify(chatHistory));
  }
}
function speak(text) {
  if (!("speechSynthesis" in window)) { toast("இந்த browser-ல் குரல் வசதி இல்லை."); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ta-IN"; utterance.rate = 0.94; utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const tamilVoice = voices.find(v => v.lang.toLowerCase().startsWith("ta"));
  if (tamilVoice) utterance.voice = tamilVoice;
  window.speechSynthesis.speak(utterance);
}
function demoReply(text) {
  const t = text.toLowerCase();
  if (/வணக்கம்|hello|hi\b/.test(t)) return "வணக்கம்! நான் JARVIS. உன் வேலைகளில் உதவத் தயாராக இருக்கிறேன். என்ன செய்ய வேண்டும்?";
  if (/உன் பெயர்|யார் நீ|அறிமுக/.test(t)) return "நான் JARVIS தமிழ் — உனக்கான தனிப்பட்ட AI உதவியாளர். கேள்விகளுக்குப் பதில், திட்டமிடல், எழுதுதல் மற்றும் தினசரி பணிகளில் உதவுவேன்.";
  if (/நினைவில் வை|நினைவில் வைத்துக்கொள்|remember/.test(t)) {
    const item = text.replace(/.*?(நினைவில் வை|நினைவில் வைத்துக்கொள்|remember)\s*/i, "").trim();
    if (item) { memories.push(item); localStorage.setItem(memoryKey, JSON.stringify(memories)); return "சரி. இந்தத் தகவலை இந்த browser-ல் சேமித்துவிட்டேன்: " + item; }
    return "நினைவில் வைக்க வேண்டிய தகவலை ‘நினைவில் வை நான் தமிழ் விரும்புகிறேன்’ என்று சொல்லலாம்.";
  }
  if (/நினைவுகள்|memory/.test(t)) return memories.length ? "சேமித்த நினைவுகள்:\n• " + memories.join("\n• ") : "இன்னும் நினைவுகள் சேமிக்கப்படவில்லை. ‘நினைவில் வை ...’ என்று சொல்லிப் பார்க்கலாம்.";
  if (/நேரம்|time/.test(t)) return "உன் சாதனத்தின் நேரம்: " + new Date().toLocaleTimeString("ta-LK", {hour:"2-digit",minute:"2-digit"});
  if (/தேடு|search|இணைய/.test(t)) { const q = encodeURIComponent(text); window.open("https://www.google.com/search?q=" + q, "_blank", "noopener"); return "உன் கோரிக்கைக்கான இணையத் தேடலைத் திறந்தேன். முழுமையான AI web search வேண்டுமெனில் backend இணைக்க வேண்டும்."; }
  if (/youtube/.test(t)) { window.open("https://m.youtube.com", "_blank", "noopener"); return "YouTube திறக்கப்படுகிறது."; }
  if (/உதவி|help|என்ன செய்ய/.test(t)) return "நான் இப்போது உரையாடல், browser குரல், உள்ளூர் நினைவுகள், இணையத் தேடல் மற்றும் சில விரைவு செயல்களைச் செய்ய முடியும். AI பதில்களுக்கு README-யில் உள்ள இலவசத் தொடக்க backend அமைப்பைச் செய்.";
  return "உன் செய்தியைப் புரிந்துகொண்டேன். உண்மையான AI பதில்களைப் பெற API backend அமைக்க வேண்டும். இப்போது demo mode இயங்குகிறது. README கோப்பில் உள்ள படிகளைப் பின்பற்று.";
}
async function getReply(text) {
  if (!API_BASE) return demoReply(text);
  try {
    const response = await fetch(API_BASE.replace(/\/$/, "") + "/chat", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({message:text, history:chatHistory.slice(-12), memories:memories.slice(-30)})
    });
    if (!response.ok) throw new Error("Backend error " + response.status);
    const data = await response.json();
    return data.reply || "பதில் கிடைக்கவில்லை.";
  } catch (e) {
    console.error(e); return "AI சேவையை இப்போது அணுக முடியவில்லை. Internet மற்றும் backend URL-ஐ சரிபார்.";
  }
}
async function send(text) {
  text = (text || "").trim(); if (!text) return;
  addMessage("user", text); input.value = ""; setStatus("THINKING"); $("heroStatus").textContent = "யோசித்துக்கொண்டிருக்கிறேன்…";
  const waiting = document.createElement("article"); waiting.className = "message assistant";
  waiting.innerHTML = '<div class="avatar">J</div><div class="bubble"><div class="speaker">JARVIS</div><p>சற்று பொறுத்திரு…</p></div>';
  messagesEl.append(waiting); messagesEl.scrollTop = messagesEl.scrollHeight;
  const reply = await getReply(text); waiting.remove(); addMessage("assistant", reply);
  setStatus("READY"); $("heroStatus").textContent = "உன் கட்டளைக்காகக் காத்திருக்கிறேன்";
  speak(reply);
}
$("chatForm").addEventListener("submit", e => { e.preventDefault(); send(input.value); });
document.querySelectorAll("[data-prompt]").forEach(btn => btn.addEventListener("click", () => send(btn.dataset.prompt)));
$("clearChat").addEventListener("click", () => { chatHistory = []; localStorage.removeItem(historyKey); messagesEl.innerHTML = ""; addMessage("assistant", "உரையாடல் அழிக்கப்பட்டது. புதிதாகத் தொடங்கலாம்.", false); toast("உரையாடல் அழிக்கப்பட்டது"); });
$("openYoutube").addEventListener("click", () => window.open("https://m.youtube.com", "_blank", "noopener"));
$("openSearch").addEventListener("click", () => { const q = prompt("எதை இணையத்தில் தேட வேண்டும்?"); if(q) window.open("https://www.google.com/search?q="+encodeURIComponent(q), "_blank", "noopener"); });
$("openMaps").addEventListener("click", () => { const q = prompt("எந்த இடத்தைத் தேட வேண்டும்?"); if(q) window.open("https://www.google.com/maps/search/"+encodeURIComponent(q), "_blank", "noopener"); });
$("openSettings").addEventListener("click", () => { window.location.href = "intent:#Intent;action=android.settings.SETTINGS;end"; setTimeout(()=>toast("திறக்க முடியாவிட்டால் Android Settings-ஐ கைமுறையாகத் திற"),700); });
$("memoryButton").addEventListener("click", () => {
  const list = memories.length ? memories.map((m,i)=>(i+1)+". "+m).join("\n") : "சேமித்த நினைவுகள் எதுவும் இல்லை.";
  const action = prompt("JARVIS MEMORY\n\n"+list+"\n\nநினைவுகளை அழிக்க CLEAR என்று உள்ளிடு.", "");
  if (action && action.trim().toUpperCase() === "CLEAR") { memories.length = 0; localStorage.setItem(memoryKey, "[]"); toast("நினைவுகள் அழிக்கப்பட்டன"); }
});
voiceButton.addEventListener("click", () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast("இந்த browser speech recognition ஆதரிக்கவில்லை. Android Chrome-ல் முயற்சி செய்."); return; }
  if (isListening && recognition) { recognition.stop(); return; }
  recognition = new SR(); recognition.lang = "ta-IN"; recognition.interimResults = false; recognition.maxAlternatives = 1;
  recognition.onstart = () => { isListening = true; voiceButton.classList.add("listening"); setStatus("LISTENING"); $("heroStatus").textContent = "கேட்கிறேன்… இப்போது பேசு"; };
  recognition.onresult = e => { const said = e.results[0][0].transcript; input.value = said; send(said); };
  recognition.onerror = e => toast("Voice error: " + e.error + ". Microphone permission-ஐ சரிபார்.");
  recognition.onend = () => { isListening = false; voiceButton.classList.remove("listening"); if ($("statusText").textContent === "LISTENING") setStatus("READY"); $("heroStatus").textContent = "உன் கட்டளைக்காகக் காத்திருக்கிறேன்"; };
  recognition.start();
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.warn));
}
window.speechSynthesis?.getVoices();
