/* ============================================================
   Cartomancia — lógica do app
   Firebase (auth + realtime database) + UI
   ============================================================ */

const APP_VERSION = '2.0.0';

const firebaseConfig = {
  apiKey: "AIzaSyAqgPPmWG6cM3xpFLtOBjQJ8PmAVV7YgaY",
  authDomain: "chatt-4bfcd.firebaseapp.com",
  databaseURL: "https://chatt-4bfcd-default-rtdb.firebaseio.com",
  projectId: "chatt-4bfcd",
  storageBucket: "chatt-4bfcd.firebasestorage.app",
  messagingSenderId: "1056039006721",
  appId: "1:1056039006721:web:7df8605c6dc1b77b460600"
};

let auth = null, db = null, firebaseReady = false;
try{
  if (typeof firebase !== 'undefined'){
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();
    // Mantém a sessão salva no navegador entre visitas.
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebaseReady = true;
  }
} catch(e){ console.error('Falha ao iniciar o Firebase:', e); }

/* ---------------- Splash / versão ---------------- */
function hideSplash(){
  const splash = document.getElementById('screenLoading');
  if (splash) splash.classList.add('fade-out');
}
const versionEl = document.getElementById('appVersion');
if (versionEl) versionEl.textContent = 'v' + APP_VERSION;

/* ---------------- Starfield ---------------- */
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let w, h, stars;
function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  const count = Math.floor((w*h)/9000);
  stars = Array.from({length: count}, () => ({
    x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.3+0.2,
    base: Math.random()*0.5+0.3, speed: Math.random()*0.02+0.005, phase: Math.random()*Math.PI*2
  }));
}
function drawStars(t){
  ctx.clearRect(0,0,w,h);
  for(const s of stars){
    const tw = s.base + Math.sin(t*s.speed + s.phase)*0.35;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(227,201,138,${Math.max(0, tw)})`; ctx.fill();
  }
  requestAnimationFrame(drawStars);
}
window.addEventListener('resize', resize);
resize(); requestAnimationFrame(drawStars);

/* ---------------- Tarot card flip ---------------- */
document.getElementById('tarotCard').addEventListener('click', function(){
  if (isGuest){ exigirConta('jogar as cartas'); return; }
  this.classList.toggle('flipped');
});

/* ================= AUTH ================= */
let authMode = 'signup';
const modeThumb = document.getElementById('modeThumb');

function setAuthMode(mode){
  authMode = mode;
  document.getElementById('tabSignup').classList.toggle('active', mode === 'signup');
  document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
  document.getElementById('signupFields').classList.toggle('hidden', mode !== 'signup');
  if (modeThumb) modeThumb.classList.toggle('right', mode === 'login');
  document.getElementById('authSub').textContent = mode === 'signup' ? 'Crie sua conta para entrar na mesa.' : 'Que bom te ver de novo.';
  document.getElementById('authSubmitLabel').textContent = mode === 'signup' ? 'Criar conta' : 'Entrar';
  document.getElementById('authFoot').innerHTML = mode === 'signup'
    ? 'Já tem conta? <a id="authSwitch">Entrar</a>'
    : 'Ainda não tem conta? <a id="authSwitch">Criar conta</a>';
  document.getElementById('authSwitch').addEventListener('click', () => setAuthMode(mode === 'signup' ? 'login' : 'signup'));
  hideAuthErr();
  hideGuestNotice();
}
document.getElementById('tabSignup').addEventListener('click', () => setAuthMode('signup'));
document.getElementById('tabLogin').addEventListener('click', () => setAuthMode('login'));
document.getElementById('authSwitch').addEventListener('click', () => setAuthMode('login'));

document.getElementById('eyeBtn').addEventListener('click', () => {
  const p = document.getElementById('fSenha');
  p.type = p.type === 'password' ? 'text' : 'password';
});

function showAuthErr(msg){
  document.getElementById('authErrText').textContent = msg;
  document.getElementById('authErr').classList.add('show');
}
function hideAuthErr(){ document.getElementById('authErr').classList.remove('show'); }

function traduzErro(code){
  const map = {
    'auth/email-already-in-use': 'Esse e-mail já tem conta. Toque em "Entrar".',
    'auth/invalid-email': 'Digite um e-mail válido.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/user-not-found': 'Não achamos conta com esse e-mail.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
    'auth/requires-recent-login': 'Por segurança, confirme sua senha atual de novo.'
  };
  return map[code] || 'Algo deu errado. Tente de novo.';
}

document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAuthErr();

  if (!firebaseReady){
    showAuthErr('Não foi possível conectar ao servidor agora. Verifique sua internet e tente de novo.');
    return;
  }

  const email = document.getElementById('fEmail').value.trim();
  const senha = document.getElementById('fSenha').value;
  const btn = document.getElementById('authSubmit');
  const spinner = document.getElementById('authSpinner');
  btn.disabled = true; spinner.classList.add('show');

  try{
    if (authMode === 'signup'){
      const nome = document.getElementById('fNome').value.trim();
      const nick = document.getElementById('fNick').value.trim();
      const ano = document.getElementById('fAno').value;
      const mes = document.getElementById('fMes').value;
      const dia = document.getElementById('fDia').value;
      const genero = document.getElementById('fGenero').value;

      if (!nome || !ano || !mes || !dia || !genero){
        showAuthErr('Preencha nome, data de nascimento e gênero.');
        btn.disabled = false; spinner.classList.remove('show');
        return;
      }

      const cred = await auth.createUserWithEmailAndPassword(email, senha);
      await cred.user.updateProfile({ displayName: nome });
      await db.ref('usuarios/' + cred.user.uid).set({
        nome, nick: nick || nome, ano, mes, dia, genero, email
      });
      if (chatPublicoRef){
        chatPublicoRef.push({
          uid: 'bot', nome: 'Cartomancia',
          texto: 'Bem-vindo, ' + (nick || nome) + '!',
          ts: Date.now(), expiraEm: Date.now() + 40000
        });
      }
    } else {
      await auth.signInWithEmailAndPassword(email, senha);
    }
    // onAuthStateChanged cuida de trocar de tela
  } catch(err){
    showAuthErr(traduzErro(err.code));
  } finally {
    btn.disabled = false; spinner.classList.remove('show');
  }
});

/* ================= ESTADO DE SESSÃO ================= */
let perfilAtual = null;
let isGuest = false;

/* Convidado: entra sem conta, mas cartas e chat ficam bloqueados. */
function hideGuestNotice(){
  document.getElementById('guestNotice').classList.remove('show');
}
function exigirConta(motivo){
  mostrarTela('auth');
  setAuthMode('signup');
  document.getElementById('guestNoticeText').textContent = 'Crie uma conta para ' + motivo + '.';
  document.getElementById('guestNotice').classList.add('show');
}
document.getElementById('guestBtn').addEventListener('click', () => {
  isGuest = true;
  perfilAtual = { nome: 'Convidado', nick: 'Convidado' };
  document.getElementById('greetName').textContent = 'Convidado';
  mostrarTela('app');
});

function mostrarTela(tela){
  document.getElementById('screenAuth').classList.toggle('hidden', tela !== 'auth');
  document.getElementById('screenApp').classList.toggle('hidden', tela !== 'app');
  hideSplash();
}

if (firebaseReady){
  auth.onAuthStateChanged(async (user) => {
    if (user){
      isGuest = false;
      const snap = await db.ref('usuarios/' + user.uid).once('value');
      perfilAtual = snap.val() || { nome: user.displayName || 'visitante' };
      document.getElementById('greetName').textContent = perfilAtual.nick || perfilAtual.nome || 'visitante';
      document.getElementById('setNome').value = perfilAtual.nome || '';
      mostrarTela('app');
    } else {
      mostrarTela('auth');
    }
  });
} else {
  // Sem Firebase disponível (ex.: sem internet): mostra a tela de entrada mesmo assim,
  // pra pessoa não ficar olhando pra uma tela em branco.
  mostrarTela('auth');
}

/* ================= TABS ================= */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    if (tab === 'tarot' && isGuest){ exigirConta('jogar o tarot'); return; }
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panelCartaz').classList.toggle('hidden', tab !== 'cartaz');
    document.getElementById('panelChat').classList.toggle('hidden', tab !== 'chat');
    document.getElementById('panelPrecos').classList.toggle('hidden', tab !== 'precos');
    document.getElementById('panelTarot').classList.toggle('hidden', tab !== 'tarot');
  });
});

/* ================= BOTÃO DE BAIXAR APP (robô) ================= */
const dlFab = document.getElementById('dlFab');
const dlPop = document.getElementById('dlPop');
if (dlFab && dlPop){
  dlFab.addEventListener('click', (e) => {
    e.stopPropagation();
    const showing = dlPop.classList.toggle('hidden') === false;
    dlFab.setAttribute('aria-expanded', String(showing));
  });
  document.addEventListener('click', (e) => {
    if (!dlPop.classList.contains('hidden') && !dlPop.contains(e.target) && e.target !== dlFab){
      dlPop.classList.add('hidden');
      dlFab.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ================= MENU DE CONTA ================= */
const accountPop = document.getElementById('accountPop');
document.getElementById('accountBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  accountPop.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
  if (!accountPop.classList.contains('hidden') && !accountPop.contains(e.target)){
    accountPop.classList.add('hidden');
  }
});
document.getElementById('btnSairConta').addEventListener('click', () => {
  accountPop.classList.add('hidden');
  if (isGuest){ isGuest = false; mostrarTela('auth'); setAuthMode('login'); return; }
  if (firebaseReady) auth.signOut();
});
document.getElementById('btnNovaConta').addEventListener('click', async () => {
  accountPop.classList.add('hidden');
  isGuest = false;
  if (firebaseReady) await auth.signOut();
  setAuthMode('signup');
});

/* ================= CONFIGURAÇÕES ================= */
document.getElementById('settingsBtn').addEventListener('click', () => {
  clearSetMsgs();
  document.getElementById('settingsModal').classList.remove('hidden');
});
document.getElementById('closeSettings').addEventListener('click', () => {
  document.getElementById('settingsModal').classList.add('hidden');
});

function clearSetMsgs(){
  document.getElementById('setErr').classList.remove('show');
  document.getElementById('setOk').classList.remove('show');
}
function setErr(msg){
  clearSetMsgs();
  document.getElementById('setErrText').textContent = msg;
  document.getElementById('setErr').classList.add('show');
}
function setOk(msg){
  clearSetMsgs();
  document.getElementById('setOkText').textContent = msg;
  document.getElementById('setOk').classList.add('show');
}

// Trocar nome — não precisa reautenticar, é só um dado de perfil.
document.getElementById('btnSalvarNome').addEventListener('click', async () => {
  const novoNome = document.getElementById('setNome').value.trim();
  if (!novoNome) { setErr('Digite um nome.'); return; }
  try{
    const user = auth.currentUser;
    await user.updateProfile({ displayName: novoNome });
    await db.ref('usuarios/' + user.uid + '/nome').set(novoNome);
    perfilAtual.nome = novoNome;
    document.getElementById('greetName').textContent = perfilAtual.nick || novoNome;
    setOk('Nome atualizado.');
  } catch(err){ setErr(traduzErro(err.code)); }
});

// Trocar e-mail — precisa confirmar com a senha atual (reautenticação).
document.getElementById('btnSalvarEmail').addEventListener('click', async () => {
  const novoEmail = document.getElementById('setNovoEmail').value.trim();
  const senhaAtual = document.getElementById('setSenhaAtual').value;
  if (!novoEmail || !senhaAtual) { setErr('Preencha o novo e-mail e a senha atual.'); return; }
  try{
    const user = auth.currentUser;
    const cred = firebase.auth.EmailAuthProvider.credential(user.email, senhaAtual);
    await user.reauthenticateWithCredential(cred);
    await user.updateEmail(novoEmail);
    await db.ref('usuarios/' + user.uid + '/email').set(novoEmail);
    document.getElementById('setNovoEmail').value = '';
    document.getElementById('setSenhaAtual').value = '';
    setOk('E-mail atualizado.');
  } catch(err){ setErr(traduzErro(err.code)); }
});

// Trocar senha — não precisa da senha antiga (sessão já está ativa).
document.getElementById('btnSalvarSenha').addEventListener('click', async () => {
  const novaSenha = document.getElementById('setNovaSenha').value;
  if (!novaSenha || novaSenha.length < 6) { setErr('A nova senha precisa ter pelo menos 6 caracteres.'); return; }
  try{
    const user = auth.currentUser;
    await user.updatePassword(novaSenha);
    document.getElementById('setNovaSenha').value = '';
    setOk('Senha atualizada.');
  } catch(err){ setErr(traduzErro(err.code)); }
});

/* ================= CHAT PÚBLICO ================= */
// Lista simples de termos a filtrar (pode ser ampliada). O objetivo é
// manter a conversa respeitosa — não é um sistema perfeito, é um filtro básico.
const palavrasBloqueadas = ['porra','merda','caralho','viado','puta','fdp','arrombado','desgraça','idiota','burro','otario','otário'];

function contemPalavraRuim(texto){
  const limpo = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return palavrasBloqueadas.some(p => limpo.includes(p));
}

const UMA_HORA = 60 * 60 * 1000;
const chatPublicoRef = firebaseReady ? db.ref('chatPublico/mensagens') : null;
const expiryMap = {}; // key -> timestamp de expiração, usado pelo cronômetro

function iniciais(nome){
  return (nome || '?').trim().charAt(0).toUpperCase();
}

// Diretório nick -> uid, construído a partir de quem já apareceu no chat público.
// É o que permite o @menção encontrar a pessoa certa (e alimenta o painel de sugestão).
const nomeParaUid = {};
const nomeExibicao = {}; // chave -> nome com acentuação original, pra mostrar no painel
function chaveNome(nome){
  return (nome || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function renderPublicMsg(key, val){
  const expiraEm = val.expiraEm || (val.ts + UMA_HORA);
  if (Date.now() >= expiraEm) return; // já expirou, nem mostra
  expiryMap[key] = expiraEm;

  if (val.uid && val.uid !== 'bot'){
    nomeParaUid[chaveNome(val.nome)] = val.uid;
    nomeExibicao[chaveNome(val.nome)] = val.nome;
  }

  // Mensagem gigante que passou de algum jeito do limite: o bot apaga.
  if (val.texto && val.texto.length > 300){
    if (chatPublicoRef) chatPublicoRef.child(key).remove();
    return;
  }

  // Mensagem com @menção: só o remetente e a pessoa marcada enxergam.
  if (val.mencionadoUid){
    const souRemetente = auth.currentUser && val.uid === auth.currentUser.uid;
    const souMencionado = auth.currentUser && val.mencionadoUid === auth.currentUser.uid;
    if (!souRemetente && !souMencionado) return;
  }

  const win = document.getElementById('chatWindow');
  const isOwn = auth.currentUser && val.uid === auth.currentUser.uid;
  const isBot = val.uid === 'bot';

  const row = document.createElement('div');
  row.className = 'msg-row ' + (isOwn ? 'own' : 'other');
  row.dataset.key = key;

  const avatar = document.createElement('div');
  avatar.className = 'avatar' + (isBot ? ' bot' : '') + (isOwn ? ' no-click' : '');
  avatar.textContent = isBot ? '✦' : iniciais(val.nome);
  if (!isOwn && !isBot){
    avatar.addEventListener('click', () => abrirConversaPrivada(val.uid, val.nome));
  }

  const col = document.createElement('div');
  col.className = 'msg-col';
  if (!isOwn){
    const nameEl = document.createElement('div');
    nameEl.className = 'msg-name';
    nameEl.textContent = val.nome;
    col.appendChild(nameEl);
  }
  if (val.mencionadoUid){
    const tag = document.createElement('div');
    tag.className = 'mention-tag';
    tag.textContent = '🔒 só pra @' + val.mencionadoNome;
    col.appendChild(tag);
  }
  const bubble = document.createElement('div');
  bubble.className = 'msg ' + (isBot ? 'bot' : (isOwn ? 'user' : 'bot')) + (val.mencionadoUid ? ' mention' : '');
  bubble.textContent = val.texto;
  col.appendChild(bubble);

  row.appendChild(avatar);
  row.appendChild(col);
  win.appendChild(row);
  win.scrollTop = win.scrollHeight;
}

function removerPublicMsgDom(key){
  delete expiryMap[key];
  const el = document.querySelector('#chatWindow [data-key="' + key + '"]');
  if (el) el.remove();
}

if (chatPublicoRef){
  chatPublicoRef.limitToLast(100).on('child_added', (snap) => renderPublicMsg(snap.key, snap.val()));
  chatPublicoRef.on('child_removed', (snap) => removerPublicMsgDom(snap.key));

  // Limpeza periódica: remove do banco quem já passou da validade.
  setInterval(() => {
    chatPublicoRef.once('value').then((snapshot) => {
      const agora = Date.now();
      snapshot.forEach((child) => {
        const val = child.val();
        const expiraEm = val.expiraEm || (val.ts + UMA_HORA);
        if (agora >= expiraEm) chatPublicoRef.child(child.key).remove();
      });
    });
  }, 5000);
}

// Cronômetro no topo do chat: mostra quanto falta para a próxima mensagem sumir.
setInterval(() => {
  const agora = Date.now();
  Object.keys(expiryMap).forEach((key) => {
    if (expiryMap[key] <= agora) removerPublicMsgDom(key);
  });
  const restantes = Object.values(expiryMap).filter(t => t > agora);
  const el = document.getElementById('chatTimer');
  if (!restantes.length){ el.textContent = '—:—'; return; }
  const proxima = Math.min(...restantes) - agora;
  const mm = Math.floor(proxima / 60000);
  const ss = Math.floor((proxima % 60000) / 1000);
  el.textContent = String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
}, 1000);

function enviarMensagem(){
  if (isGuest){ exigirConta('mandar mensagens no chat'); return; }
  const input = document.getElementById('chatInput');
  const texto = input.value.trim().slice(0, 300);
  const user = auth.currentUser;
  if (!texto || !chatPublicoRef || !user || !perfilAtual) return;
  input.value = '';
  const nome = perfilAtual.nick || perfilAtual.nome || 'visitante';

  // @menção: se o texto citar um @nome que já apareceu no chat, a mensagem
  // fica marcada como visível só pro remetente e pra pessoa marcada.
  const payload = { uid: user.uid, nome, texto, ts: Date.now() };
  const marcado = texto.match(/@([^\s@]+)/);
  if (marcado){
    const uidAlvo = nomeParaUid[chaveNome(marcado[1])];
    if (uidAlvo && uidAlvo !== user.uid){
      payload.mencionadoUid = uidAlvo;
      payload.mencionadoNome = marcado[1];
    }
  }

  chatPublicoRef.push(payload);

  if (contemPalavraRuim(texto)){
    chatPublicoRef.push({
      uid: 'bot', nome: 'Cartomancia',
      texto: 'Vamos manter esse espaço tranquilo 🙏 tenta reformular a mensagem.',
      ts: Date.now()
    });
  }
}

document.getElementById('chatSend').addEventListener('click', enviarMensagem);
document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') enviarMensagem();
});

/* ---- painel de sugestão do @menção ---- */
const mentionPop = document.getElementById('mentionPop');
const chatInputEl = document.getElementById('chatInput');

function fecharMentionPop(){
  mentionPop.classList.add('hidden');
  mentionPop.innerHTML = '';
}

chatInputEl.addEventListener('input', () => {
  const valor = chatInputEl.value;
  const cursor = chatInputEl.selectionStart;
  const antesCursor = valor.slice(0, cursor);
  const m = antesCursor.match(/@([^\s@]*)$/);
  if (!m){ fecharMentionPop(); return; }

  const filtro = chaveNome(m[1]);
  const meuNome = perfilAtual ? chaveNome(perfilAtual.nick || perfilAtual.nome) : '';
  const candidatos = Object.keys(nomeExibicao)
    .filter(chave => chave !== meuNome && chave.startsWith(filtro))
    .map(chave => nomeExibicao[chave]);

  if (!candidatos.length){ fecharMentionPop(); return; }

  mentionPop.innerHTML = '';
  candidatos.slice(0, 6).forEach(nome => {
    const item = document.createElement('div');
    item.className = 'mention-pop-item';
    item.textContent = '@' + nome;
    item.addEventListener('click', () => {
      const inicioArroba = cursor - m[0].length;
      chatInputEl.value = valor.slice(0, inicioArroba) + '@' + nome + ' ' + valor.slice(cursor);
      fecharMentionPop();
      chatInputEl.focus();
    });
    mentionPop.appendChild(item);
  });
  mentionPop.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
  if (!mentionPop.classList.contains('hidden') && !mentionPop.contains(e.target) && e.target !== chatInputEl){
    fecharMentionPop();
  }
});

/* ================= CONVERSA PRIVADA (não expira) ================= */
let privateRefAtual = null;
let privateListenerAtual = null;
let privateOutroUid = null;

function abrirConversaPrivada(outroUid, outroNome){
  if (isGuest){ exigirConta('conversar em privado'); return; }
  if (!auth.currentUser) return;
  privateOutroUid = outroUid;
  document.getElementById('privateNomeTitulo').textContent = 'Conversa com ' + outroNome;
  document.getElementById('privateWindow').innerHTML = '';

  if (privateRefAtual && privateListenerAtual){
    privateRefAtual.off('child_added', privateListenerAtual);
  }

  const pairKey = [auth.currentUser.uid, outroUid].sort().join('_');
  privateRefAtual = db.ref('chatsPrivados/' + pairKey + '/mensagens');
  privateListenerAtual = (snap) => renderPrivateMsg(snap.val());
  privateRefAtual.on('child_added', privateListenerAtual);

  document.getElementById('privateModal').classList.remove('hidden');
}

function renderPrivateMsg(val){
  const win = document.getElementById('privateWindow');
  const isOwn = auth.currentUser && val.de === auth.currentUser.uid;
  const row = document.createElement('div');
  row.className = 'msg-row ' + (isOwn ? 'own' : 'other');
  const bubble = document.createElement('div');
  bubble.className = 'msg ' + (isOwn ? 'user' : 'bot');
  bubble.textContent = val.texto;
  row.appendChild(bubble);
  win.appendChild(row);
  win.scrollTop = win.scrollHeight;
}

function enviarPrivada(){
  const input = document.getElementById('privateInput');
  const texto = input.value.trim().slice(0, 300);
  if (!texto || !privateRefAtual || !auth.currentUser) return;
  input.value = '';
  privateRefAtual.push({ de: auth.currentUser.uid, texto, ts: Date.now() });
}

document.getElementById('privateSend').addEventListener('click', enviarPrivada);
document.getElementById('privateInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') enviarPrivada();
});
document.getElementById('closePrivate').addEventListener('click', () => {
  document.getElementById('privateModal').classList.add('hidden');
  if (privateRefAtual && privateListenerAtual) privateRefAtual.off('child_added', privateListenerAtual);
  privateRefAtual = null; privateListenerAtual = null;
});

/* ================= TAROT — baralho cigano, 3 leituras grátis =================
   Aba nova ao lado de "Preços". Convidado é bloqueado por exigirConta(). */

const T_CARDS = [
  {n:"Cavaleiro", e:"algo novo se aproxima depressa — uma notícia, uma visita ou uma virada de ritmo que muda o que parecia parado"},
  {n:"Trevo", e:"uma pequena chance surge; não é o grande milagre, mas é a brecha que, aproveitada, muda o rumo do dia"},
  {n:"Navio", e:"um deslocamento se anuncia — uma saída, uma mudança de rota ou um recomeço em outro lugar"},
  {n:"Casa", e:"as bases se firmam: família, lar ou uma estrutura que sustenta tudo o que vem depois"},
  {n:"Árvore", e:"o que cresce aqui é lento e vivo — saúde, raízes, um processo que não se apressa"},
  {n:"Nuvens", e:"há névoa sobre o assunto: dúvida, um momento de não saber, e é preciso esperar clarear"},
  {n:"Cobra", e:"cuidado com o que se disfarça de solução — sedução, desvio ou uma complicação escondida"},
  {n:"Caixão", e:"um ciclo se fecha de verdade; não é fim triste, é o espaço vazio que abre lugar para o novo"},
  {n:"Buquê", e:"um presente chega — beleza, reconhecimento, um motivo genuíno de gratidão"},
  {n:"Foice", e:"um corte é necessário: decisão rápida, ruptura limpa, sem meio-termo"},
  {n:"Chicote", e:"um padrão se repete — discussão, tensão ou um ciclo que insiste em voltar até ser encarado"},
  {n:"Pássaros", e:"muitas vozes ao mesmo tempo: conversa, inquietação, ou uma parceria que precisa de escuta"},
  {n:"Criança", e:"um começo simples e sincero, sem o peso do passado — só o primeiro passo"},
  {n:"Raposa", e:"é hora de agir com esperteza — cautela no trabalho, discrição, um passo bem calculado"},
  {n:"Urso", e:"força e proteção entram em cena — coragem, autoridade, algo que finalmente segura a barra"},
  {n:"Estrela", e:"uma luz de orientação aparece — esperança concreta, direção clara, inspiração que guia"},
  {n:"Cegonha", e:"uma mudança está a caminho — renovação, virada de fase, algo se transforma por dentro"},
  {n:"Cachorro", e:"lealdade real se mostra — amizade, apoio sincero, alguém que permanece"},
  {n:"Torre", e:"há distância a ser respeitada — isolamento necessário, uma instituição, ou a visão de cima"},
  {n:"Jardim", e:"a vida social entra em foco — encontros, exposição, um espaço compartilhado com outros"},
  {n:"Montanha", e:"um obstáculo concreto se ergue — atraso, bloqueio, algo que exige contorno, não força"},
  {n:"Caminhos", e:"uma escolha real se apresenta — duas direções, e nenhuma decisão é neutra"},
  {n:"Ratos", e:"algo se desgasta aos poucos — perda pequena, estresse, um vazamento de energia"},
  {n:"Coração", e:"o sentimento verdadeiro aparece — amor, afeto genuíno, o que realmente importa"},
  {n:"Anel", e:"um compromisso se firma — contrato, ciclo que se fecha em aliança, continuidade"},
  {n:"Livro", e:"há algo ainda não revelado — conhecimento oculto, um segredo, um capítulo a estudar"},
  {n:"Carta", e:"uma comunicação decisiva chega — mensagem, documento, palavra que muda o quadro"},
  {n:"Homem", e:"uma energia ativa entra na cena — decisão, ação, presença marcante"},
  {n:"Mulher", e:"uma energia receptiva conduz — intuição, cuidado, presença que sustenta"},
  {n:"Lírio", e:"maturidade e paz se instalam — serenidade, experiência, calma que só o tempo dá"},
  {n:"Sol", e:"clareza e sucesso iluminam o caminho — vitalidade, reconhecimento, um sim evidente"},
  {n:"Lua", e:"o reconhecimento emocional chega — intuição validada, sensibilidade, um chamado interno"},
  {n:"Chave", e:"a solução está ao alcance — certeza, destravamento, a resposta que faltava"},
  {n:"Peixes", e:"abundância entra em fluxo — dinheiro, prosperidade, recursos que voltam a circular"},
  {n:"Âncora", e:"estabilidade se firma — trabalho, permanência, algo que finalmente se fixa"},
  {n:"Cruz", e:"uma provação com sentido se apresenta — destino, fé, um peso que carrega aprendizado"}
];

const T_CATEGORIES = [
  {
    key:'ano', num:'I', title:'Como vai ser meu ano', desc:'Uma leitura de cinco tempos sobre o ano que se desenrola à sua frente.',
    phases:['O que abre o ano','O que se desenrola em seguida','O centro da questão — o que mais pesa','O que ainda vai se mover','Como o ano se fecha']
  },
  {
    key:'melhorar', num:'II', title:'O que devo fazer para me melhorar', desc:'As cartas apontam o que reconhecer, soltar e cultivar.',
    phases:['O que reconhecer em você','O que já não serve e pode ser solto','O que vale cultivar','Onde buscar apoio','O passo seguinte']
  },
  {
    key:'espirito', num:'III', title:'Qual meu tipo de espiritualidade', desc:'Um olhar sobre como você se conecta com o que não se vê.',
    phases:['Sua raiz espiritual','Como você se conecta ao invisível','O que bloqueia essa conexão','Seu dom natural','Para onde essa jornada caminha']
  },
  {
    key:'vidapassada', num:'IV', title:'Como foi minha vida passada', desc:'As cartas reconstroem o eco de quem você já foi.',
    phases:['Quem você foi','A marca que ficou em você','A lição que essa vida deixou','O que se repete hoje','O que finalmente foi encerrado']
  }
];

const T_MAX_PLAYS = 3;
let tPlaysUsed = 0;
let tCurrentCategory = null;

function tRenderCategories(){
  const catsEl = document.getElementById('tCategories');
  catsEl.innerHTML = '';
  T_CATEGORIES.forEach(cat=>{
    const div = document.createElement('div');
    div.className = 't-cat-card';
    div.innerHTML = `<span class="t-cat-num">${cat.num}</span><div class="t-cat-title">${cat.title}</div><div class="t-cat-desc">${cat.desc}</div>`;
    div.addEventListener('click', ()=> tOpenShuffle(cat));
    catsEl.appendChild(div);
  });
}
tRenderCategories();

function tRenderPlaysMeter(){
  const dotsEl = document.getElementById('tPlaysDots');
  dotsEl.innerHTML = '';
  for(let i=0;i<T_MAX_PLAYS;i++){
    const d = document.createElement('div');
    d.className = 't-play-dot' + (i < tPlaysUsed ? ' used' : '');
    dotsEl.appendChild(d);
  }
  const locked = tPlaysUsed >= T_MAX_PLAYS;
  document.getElementById('tCategories').style.display = locked ? 'none' : 'grid';
  document.getElementById('tLockedMsg').style.display = locked ? 'block' : 'none';
}
tRenderPlaysMeter();

function tShowScreen(id){
  document.querySelectorAll('#panelTarot .t-screen').forEach(s=>s.classList.remove('t-active'));
  document.getElementById(id).classList.add('t-active');
}

function tOpenShuffle(cat){
  tCurrentCategory = cat;
  document.getElementById('tChosenLabel').textContent = cat.title;
  document.getElementById('tShuffleStatus').innerHTML = '&nbsp;';
  document.getElementById('tDeckArea').classList.remove('shuffling');
  const btn = document.getElementById('tStartShuffleBtn');
  btn.disabled = false;
  btn.textContent = 'Clique para embaralhar';
  tShowScreen('t-screen-shuffle');
}

document.getElementById('tBackFromShuffle').addEventListener('click', ()=>{
  tRenderPlaysMeter();
  tShowScreen('t-screen-home');
});

document.getElementById('tStartShuffleBtn').addEventListener('click', function(){
  if(tPlaysUsed >= T_MAX_PLAYS) return;
  const btn = this;
  btn.disabled = true;
  const deckArea = document.getElementById('tDeckArea');
  const statusEl = document.getElementById('tShuffleStatus');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  deckArea.classList.add('shuffling');
  let secondsLeft = 15;
  statusEl.textContent = 'embaralhando... ' + secondsLeft + 's';

  const tick = setInterval(()=>{
    secondsLeft--;
    if(secondsLeft > 0){
      statusEl.textContent = 'embaralhando... ' + secondsLeft + 's';
    } else {
      statusEl.textContent = 'as cartas se aquietam...';
    }
  }, 1000);

  const totalWait = reduced ? 2200 : 15000;
  setTimeout(()=>{
    clearInterval(tick);
    deckArea.classList.remove('shuffling');
    tPlaysUsed++;
    tStartReading(tCurrentCategory);
  }, totalWait);
});

function tDrawFive(){
  const idx = [...Array(T_CARDS.length).keys()];
  for(let i=idx.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0,5).map(i=>T_CARDS[i]);
}

function tStartReading(cat){
  const drawn = tDrawFive();
  document.getElementById('tReadingLabel').textContent = cat.title;

  const fan = document.getElementById('tFan');
  fan.innerHTML = '';
  drawn.forEach((card, i)=>{
    const el = document.createElement('div');
    el.className = 't-rcard';
    el.innerHTML = `
      <div class="t-rcard-inner">
        <div class="t-rface t-back"></div>
        <div class="t-rface t-front">
          <div class="t-rnum">${cat.phases[i] ? (i+1) : ''}</div>
          <div class="t-rname">${card.n}</div>
        </div>
      </div>`;
    fan.appendChild(el);
  });

  const phasesEl = document.getElementById('tPhases');
  phasesEl.innerHTML = '';
  drawn.forEach((card, i)=>{
    const row = document.createElement('div');
    row.className = 't-phase-row';
    row.innerHTML = `
      <div class="t-phase-idx">${String(i+1).padStart(2,'0')}</div>
      <div>
        <div class="t-phase-label">${cat.phases[i]}</div>
        <div class="t-phase-cardname">${card.n}</div>
        <div class="t-phase-text">A carta indica que ${card.e}.</div>
      </div>`;
    phasesEl.appendChild(row);
  });

  const synthEl = document.getElementById('tSynthesis');
  synthEl.classList.remove('show');
  document.getElementById('tSynthesisText').textContent =
    `Do início ao fechamento, o caminho vai de ${drawn[0].e} até ${drawn[4].e}.`;

  tShowScreen('t-screen-reading');
  tRenderPlaysMeter();

  const rcards = fan.querySelectorAll('.t-rcard');
  rcards.forEach((el, i)=>{
    setTimeout(()=> el.classList.add('flipped'), 350 + i*260);
  });

  const rows = phasesEl.querySelectorAll('.t-phase-row');
  rows.forEach((row, i)=>{
    setTimeout(()=> row.classList.add('show'), 1400 + i*300);
  });

  setTimeout(()=> synthEl.classList.add('show'), 1400 + rows.length*300 + 300);
}

document.getElementById('tNewReadingBtn').addEventListener('click', ()=>{
  tRenderPlaysMeter();
  tShowScreen('t-screen-home');
});
