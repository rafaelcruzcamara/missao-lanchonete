// === DADOS ===
const produtos = [
  { id: 1, nome: "Pastel", preco: 10.00, categoria: "salgado" },
  { id: 2, nome: "Pastelão", preco: 20.00, categoria: "salgado" },
  { id: 3, nome: "Refrigerante Lata", preco: 5.00, categoria: "bebida" },
  { id: 4, nome: "Suco Natural", preco: 5.00, categoria: "bebida" },
  { id: 5, nome: "Água Mineral", preco: 3.00, categoria: "bebida" },
  { id: 6, nome: "Água com gás", preco: 5.00, categoria: "bebida" },
  { id: 7, nome: "Gatorade", preco: 10.00, categoria: "bebida" },
  { id: 8, nome: "Trident", preco: 5.00, categoria: "doce" },
  { id: 9, nome: "Puxa", preco: 30.00, categoria: "doce" },
  { id: 10, nome: "Doce de leite", preco: 5.00, categoria: "doce" },
  { id: 11, nome: "Açai", preco: 10.00, categoria: "doce" },
  { id: 12, nome: "KikKat", preco: 7.00, categoria: "doce" },
  { id: 13, nome: "Garoto", preco: 15.00, categoria: "doce" },
  { id: 14, nome: "Paçoca", preco: 2.00, categoria: "doce" },
  { id: 15, nome: "Halls", preco: 4.00, categoria: "doce" }
];

let pedido = [];
let relatorio = JSON.parse(localStorage.getItem('relatorioPedidos') || '[]');

// === FUNÇÕES ===
function toggleCategoria(id) {
  const lista = document.getElementById(id);
  const icone = lista.previousElementSibling.querySelector('.toggle-icon');
  if (lista.style.display === 'none') {
    lista.style.display = 'block';
    icone.textContent = '▼';
  } else {
    lista.style.display = 'none';
    icone.textContent = '▶';
  }
}

function atualizarProdutos() {
  const categorias = {
    salgado: document.getElementById('salgados'),
    bebida: document.getElementById('bebidas'),
    doce: document.getElementById('doces')
  };
  Object.values(categorias).forEach(div => div.innerHTML = '');

  produtos.forEach(prod => {
    const div = categorias[prod.categoria];
    const el = document.createElement('div');
    el.className = 'produto-item';
    el.innerHTML = `
      <span class="produto-nome">${prod.nome}</span>
      <span class="produto-preco">R$ ${prod.preco.toFixed(2)}</span>
      <input type="number" min="1" value="1" id="qtd_${prod.id}">
      <button onclick="adicionarAoPedido(${prod.id})">Adicionar</button>
    `;
    div.appendChild(el);
  });
}

function adicionarAoPedido(id) {
  const qtd = parseInt(document.getElementById('qtd_' + id).value) || 1;
  const produto = produtos.find(p => p.id === id);
  const item = pedido.find(p => p.id === id);
  if (item) item.qtd += qtd;
  else pedido.push({ ...produto, qtd });
  atualizarPedido();
}

function removerDoPedido(id) {
  pedido = pedido.filter(p => p.id !== id);
  atualizarPedido();
}

function atualizarPedido() {
  const pedDiv = document.getElementById('pedido');
  pedDiv.innerHTML = '';
  let total = 0;
  pedido.forEach(p => {
    const subtotal = p.qtd * p.preco;
    total += subtotal;
    pedDiv.innerHTML += `
      <div class="pedido-item">
        <span>${p.qtd}x ${p.nome}</span>
        <span>R$ ${subtotal.toFixed(2)} <button onclick="removerDoPedido(${p.id})">Remover</button></span>
      </div>
    `;
  });
  document.getElementById('pedidoTotal').textContent = `Total: R$ ${total.toFixed(2)}`;
}

function limparPedido() {
  pedido = [];
  atualizarPedido();
}

function imprimirNotaFiscal() {
  if (pedido.length === 0) return alert("Adicione produtos ao pedido!");
  const nome = document.getElementById('nomeCliente').value || 'Cliente';
  const win = window.open('', 'Nota', 'width=300,height=600');

  let blocos = '';
  pedido.forEach(p => {
    for (let i = 0; i < p.qtd; i++) {
      blocos += `
        <div class="bloco">
          <h3 style="text-align:center">•<br>@LANCHONETE MISES</h3>
          <p>==> Cliente: ${nome}</p>
          <p>==> <strong>${p.nome}</strong></p>
          <p>• ${new Date().toLocaleString('pt-BR')}</p>
          <p>• R$ ${p.preco.toFixed(2)}</p>
          <hr>
          <h3><br>•<br>•<br>•-------------------------<br>•<br></h3>
        </div>
        
      `;
      
      
    }
  });

  win.document.write(`
    <html><head><style>body{font-family:Arial;font-size:12px;padding:10px}.bloco{margin-bottom:20px}</style></head>
    <body>${blocos}
    <p style="text-align:right;font-weight:bold">TOTAL: R$ ${pedido.reduce((s, p) => s + p.qtd * p.preco, 0).toFixed(2)}</p>
    <script>setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},500)</script>
    </body></html>
  `);
  win.document.close();

  relatorio.push({
    data: new Date().toLocaleString(),
    cliente: nome,
    itens: [...pedido],
    total: pedido.reduce((s, p) => s + p.qtd * p.preco, 0)
  });
  localStorage.setItem('relatorioPedidos', JSON.stringify(relatorio));
  atualizarRelatorio();
  limparPedido();
  document.getElementById('nomeCliente').value = '';
}

function atualizarRelatorio() {
  const div = document.getElementById('relatorio');
  if (relatorio.length === 0) {
    div.innerHTML = '<em>Nenhum pedido ainda.</em>';
    document.getElementById('relatorioTotal').textContent = 'Total do Dia: R$ 0,00';
    return;
  }

  let total = 0;
  div.innerHTML = relatorio.map((r, i) => {
    total += r.total;
    return `
      <div>
        <strong>#${i+1}</strong> - ${r.data} (${r.cliente})<br>
        ${r.itens.map(it => `${it.qtd}x ${it.nome}`).join(', ')}<br>
        <strong>Total:</strong> R$ ${r.total.toFixed(2)}
      </div><br>
    `;
  }).join('');

  document.getElementById('relatorioTotal').textContent = `Total do Dia: R$ ${total.toFixed(2)}`;
}

function imprimirRelatorio() {
  if (relatorio.length === 0) return alert("Nenhum pedido registrado!");
  const win = window.open('', 'Relatorio', 'width=800,height=600');
  win.document.write(`
    <html><head><style>body{font-family:Arial;padding:20px}.pedido{margin-bottom:20px;border-bottom:1px dashed #ccc}.total{font-weight:bold}</style></head><body>
    <h1 style="text-align:center">Relatório do Dia</h1>
    ${relatorio.map((p, i) => `
      <div class="pedido">
        <strong>Pedido #${i+1}</strong><br>
        ${p.data} - ${p.cliente}<br>
        ${p.itens.map(it => `${it.qtd}x ${it.nome} - R$ ${(it.qtd * it.preco).toFixed(2)}`).join('<br>')}<br>
        <div class="total">Total: R$ ${p.total.toFixed(2)}</div>
      </div>
    `).join('')}
    <script>setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},500)</script>
    </body></html>
  `);
  win.document.close();
}

function limparRelatorio() {
  if (!confirm("Tem certeza que deseja limpar o relatório?")) return;
  relatorio = [];
  localStorage.removeItem('relatorioPedidos');
  atualizarRelatorio();
}

// Inicializa ao carregar
window.onload = () => {
  atualizarProdutos();
  atualizarPedido();
  atualizarRelatorio();
  ['salgados','bebidas','doces'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
    const toggle = document.querySelector(`.categoria-header[onclick*="${id}"] .toggle-icon`);
    if (toggle) toggle.textContent = '▶';
  });
};

// CORREÇÃO DEFINITIVA - Execute após o DOM carregar
function corrigirInputCliente() {
  // 1. Remove todos os inputs exceto o correto
  const todosInputs = document.querySelectorAll('input[type="text"][id="nomeCliente"]');
  const inputCorreto = document.querySelector('.controles-pedido .input-estilizado');
  
  todosInputs.forEach(input => {
    if (input !== inputCorreto) {
      input.remove();
    }
  });
  
  // 2. Garante posicionamento
  if (inputCorreto) {
    inputCorreto.style.display = 'block';
    inputCorreto.classList.add('input-estilizado');
  }
}

// Executa quando a página carrega e após 1 segundo (dupla verificação)
document.addEventListener('DOMContentLoaded', corrigirInputCliente);
setTimeout(corrigirInputCliente, 1000);
