// ===== Anúncio interstitial (antes de abrir uma aula) =====
const adOverlay = document.getElementById('adOverlay');
const adSkip = document.getElementById('adSkip');
const adCountdownEl = document.getElementById('adCountdown');
let adTimer = null;

function showAd(onDone) {
  let seconds = 5;
  adCountdownEl.textContent = seconds;
  adSkip.disabled = true;
  adSkip.textContent = `Pular anúncio (${seconds})`;

  adOverlay.classList.add('show');
  adOverlay.setAttribute('aria-hidden', 'false');

  clearInterval(adTimer);
  adTimer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(adTimer);
      adSkip.disabled = false;
      adSkip.textContent = 'Pular anúncio';
    } else {
      adSkip.textContent = `Pular anúncio (${seconds})`;
    }
  }, 1000);

  function fecharAnuncio() {
    if (adSkip.disabled) return;
    clearInterval(adTimer);
    adOverlay.classList.remove('show');
    adOverlay.setAttribute('aria-hidden', 'true');
    adSkip.removeEventListener('click', fecharAnuncio);
    onDone();
  }
  adSkip.addEventListener('click', fecharAnuncio);
}

// ===== Aulas: abrir/fechar (acordeão) =====
document.querySelectorAll('.lesson').forEach((btn) => {
  btn.setAttribute('aria-expanded', 'false');
  const id = btn.dataset.lesson;
  const body = document.getElementById('body-' + id);

  btn.addEventListener('click', () => {
    const isOpen = body.classList.contains('open');

    function abrirOuFechar() {
      // fecha as outras aulas abertas
      document.querySelectorAll('.lesson-body.open').forEach((b) => {
        if (b !== body) b.classList.remove('open');
      });
      document.querySelectorAll('.lesson[aria-expanded="true"]').forEach((b) => {
        if (b !== btn) b.setAttribute('aria-expanded', 'false');
      });

      body.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    }

    // só mostra anúncio quando está ABRINDO a aula (não ao fechar)
    if (!isOpen) {
      showAd(abrirOuFechar);
    } else {
      abrirOuFechar();
    }
  });
});

// ===== Animação: revela cards/aulas conforme rola a tela =====
const revealTargets = document.querySelectorAll('.explain-card, .lesson');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('in-view'));
}

// ===== Botão flutuante (3 pontinhos) -> abre assistente =====
const fabBtn = document.getElementById('fabBtn');
const assistant = document.getElementById('assistant');
const overlay = document.getElementById('assistantOverlay');
const closeBtn = document.getElementById('assistantClose');
const input = document.getElementById('assistantInput');
const form = document.getElementById('assistantForm');
const messages = document.getElementById('assistantMessages');

function openAssistant() {
  assistant.classList.add('open');
  overlay.classList.add('show');
  fabBtn.setAttribute('aria-expanded', 'true');
  assistant.setAttribute('aria-hidden', 'false');
  setTimeout(() => input.focus(), 200);
}
function closeAssistant() {
  assistant.classList.remove('open');
  overlay.classList.remove('show');
  fabBtn.setAttribute('aria-expanded', 'false');
  assistant.setAttribute('aria-hidden', 'true');
}

fabBtn.addEventListener('click', () => {
  assistant.classList.contains('open') ? closeAssistant() : openAssistant();
});
closeBtn.addEventListener('click', closeAssistant);
overlay.addEventListener('click', closeAssistant);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAssistant();
});

// ===== Assistente: respostas locais sobre Lua =====
// Base simples de perguntas frequentes. Nao depende de internet nem de IA externa.
const respostas = [
  { chaves: ['o que é lua', 'oque é lua', 'o que e lua', 'que é lua'],
    resposta: 'Lua é uma linguagem de programação leve, feita pra ser encaixada dentro de outros programas, tipo jogos e apps. Um script Lua é um pedaço de código que controla esse programa por dentro.' },
  { chaves: ['variável', 'variavel', 'variaveis'],
    resposta: 'Variável é uma "caixinha" que guarda um valor. Em Lua: local nome = "Ana" — o "local" cria a variável, e ela guarda o texto "Ana".' },
  { chaves: ['função', 'funcao', 'funções', 'funcoes'],
    resposta: 'Função é um bloco de código reutilizável. Exemplo: function saudacao() print("Oi!") end — depois é só chamar saudacao() sempre que precisar.' },
  { chaves: ['loop', 'laço', 'laco', 'for', 'while', 'repetir'],
    resposta: 'Loop repete uma ação várias vezes. Exemplo: for i=1,5 do print(i) end — isso imprime os números de 1 até 5.' },
  { chaves: ['tabela', 'tabelas'],
    resposta: 'Tabela é a estrutura mais usada em Lua — guarda várias coisas juntas. Exemplo: local frutas = {"maçã", "banana", "uva"}.' },
  { chaves: ['if', 'condição', 'condicao', 'senão', 'senao'],
    resposta: 'if serve pra tomar decisão. Exemplo: if vida <= 0 then print("Game over") end — só executa se a condição for verdadeira.' },
  { chaves: ['instalar', 'como uso', 'como usar', 'onde roda', 'onde rodar'],
    resposta: 'Depende do programa em que o script vai rodar — cada jogo, app ou engine tem seu próprio jeito de carregar um script Lua. Vale conferir a documentação daquele programa específico.' },
  { chaves: ['aula', 'aulas', 'lição', 'licao'],
    resposta: 'As aulas ficam na seção "Aulas de Script Lua", organizadas como fases da lua — da Aula 1 até a Aula 6. Vai abrindo uma de cada vez.' },
];

// ===== Geração de script (ServerScriptService) =====
// Fluxo: usuário pede pra criar um script -> bot pergunta o que ele deve fazer
// -> próxima mensagem é lida como a especificação -> bot devolve um modelo pronto.
let esperandoEspecificacao = false;

const gatilhosCriarScript = [
  'criar script', 'cria um script', 'cria script', 'gerar script',
  'fazer um script', 'fazer script', 'serverscriptservice', 'server script service',
];

const modelosScript = [
  { chaves: ['entra', 'entrar', 'jogador entrou', 'playeradded', 'dar item', 'dar uma ferramenta', 'dar ferramenta'],
    titulo: 'Dar um item quando o jogador entra',
    codigo:
`local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")

Players.PlayerAdded:Connect(function(player)
    local ferramenta = ServerStorage:FindFirstChild("NomeDaFerramenta")
    if ferramenta then
        ferramenta:Clone().Parent = player:WaitForChild("Backpack")
    end
end)` },
  { chaves: ['morre', 'morrer', 'morte', 'died', 'humanoid died'],
    titulo: 'Detectar quando o jogador morre',
    codigo:
`local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        local humanoid = character:WaitForChild("Humanoid")
        humanoid.Died:Connect(function()
            print(player.Name .. " morreu")
        end)
    end)
end)` },
  { chaves: ['evento remoto', 'remoteevent', 'remote event', 'comunicar com o cliente', 'localscript'],
    titulo: 'Criar um RemoteEvent (servidor ↔ cliente)',
    codigo:
`local ReplicatedStorage = game:GetService("ReplicatedStorage")

local evento = Instance.new("RemoteEvent")
evento.Name = "MeuEvento"
evento.Parent = ReplicatedStorage

evento.OnServerEvent:Connect(function(player, dado)
    print(player.Name .. " mandou:", dado)
end)` },
  { chaves: ['teleport', 'teleportar', 'mudar de lugar', 'mover jogador'],
    titulo: 'Teleportar o jogador',
    codigo:
`local destino = workspace:WaitForChild("PontoDeTeleporte")

local function teleportar(player)
    local character = player.Character
    if character then
        character:SetPrimaryPartCFrame(destino.CFrame + Vector3.new(0, 3, 0))
    end
end`,
  },
  { chaves: ['loja', 'comprar', 'sistema de compra', 'vender'],
    titulo: 'Sistema simples de compra',
    codigo:
`local ReplicatedStorage = game:GetService("ReplicatedStorage")

local comprarEvento = Instance.new("RemoteEvent")
comprarEvento.Name = "Comprar"
comprarEvento.Parent = ReplicatedStorage

local PRECO = 100

comprarEvento.OnServerEvent:Connect(function(player, idDoItem)
    local moedas = player:FindFirstChild("Moedas")
    if moedas and moedas.Value >= PRECO then
        moedas.Value -= PRECO
        -- aqui entra a lógica de entregar o item
    end
end)` },
];

function pedirEspecificacao() {
  esperandoEspecificacao = true;
  return 'Show, posso montar um modelo! Me conta rapidinho o que esse script deve fazer — por exemplo: dar um item quando o jogador entra, detectar quando o jogador morre, criar um evento remoto, teleportar o jogador, ou um sistema de loja.';
}

function gerarScriptPorEspecificacao(texto) {
  for (const modelo of modelosScript) {
    if (modelo.chaves.some((c) => texto.includes(c))) {
      return `${modelo.titulo} — coloque num Script dentro de ServerScriptService:\n\n${modelo.codigo}`;
    }
  }
  return 'Ainda não tenho um modelo pronto pra isso especificamente. Tenta descrever com outras palavras (ex: "dar item", "detectar morte", "evento remoto", "teleportar", "loja") ou pergunta sobre variável, função, loop, tabela ou condição.';
}

function responderLocalmente(pergunta) {
  const texto = pergunta.toLowerCase();

  if (esperandoEspecificacao) {
    esperandoEspecificacao = false;
    return gerarScriptPorEspecificacao(texto);
  }

  if (gatilhosCriarScript.some((c) => texto.includes(c))) {
    return pedirEspecificacao();
  }

  for (const item of respostas) {
    if (item.chaves.some((c) => texto.includes(c))) {
      return item.resposta;
    }
  }
  return 'Ainda não tenho uma resposta pronta pra isso. Tenta perguntar sobre: variável, função, loop, tabela, condição (if) ou "o que é lua".';
}

function addMsg(texto, autor) {
  const div = document.createElement('div');
  div.className = 'msg ' + autor;
  div.textContent = texto;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const pergunta = input.value.trim();
  if (!pergunta) return;
  addMsg(pergunta, 'user');
  input.value = '';

  setTimeout(() => {
    addMsg(responderLocalmente(pergunta), 'bot');
  }, 350);
});
