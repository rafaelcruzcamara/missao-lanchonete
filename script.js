// === CONFIGURAÇÃO DO FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyDA7hBt7DP8y1CiBigZURcqHOJzRLOsruI",
  authDomain: "lanchonete-7558e.firebaseapp.com",
  databaseURL: "https://lanchonete-7558e-default-rtdb.firebaseio.com",
  projectId: "lanchonete-7558e",
  storageBucket: "lanchonete-7558e.firebasestorage.app",
  messagingSenderId: "309367170629",
  appId: "1:309367170629:web:53cfca3b26c3e66519252c",
  measurementId: "G-0P2C24PX2K"
};


// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// === DADOS ===
let produtos = [];
let pedido = [];
let relatorio = [];
let editandoProdutoId = null;

// === SISTEMA DE SINCRONIZAÇÃO FIREBASE ===
function inicializarSincronizacao() {
  // Sincronizar produtos
  database.ref('produtos').on('value', (snapshot) => {
    const dados = snapshot.val();
    if (dados) {
      produtos = Object.values(dados);
      mostrarAlerta('Produtos atualizados em tempo real!', 'sucesso');
      atualizarProdutos();
      if (document.getElementById('modalGerenciadorProdutos').style.display === 'flex') {
        carregarListaProdutos();
      }
    }
  });
  
  // Sincronizar relatório
  database.ref('relatorio').on('value', (snapshot) => {
    const dados = snapshot.val();
    if (dados) {
      relatorio = Object.values(dados);
      atualizarRelatorio();
    }
  });
  
  // Carregar dados iniciais
  carregarDadosIniciais();
}

function carregarDadosIniciais() {
  database.ref('produtos').once('value').then((snapshot) => {
    const dados = snapshot.val();
    if (dados) {
      produtos = Object.values(dados);
    } else {
      // Dados iniciais padrão
      produtos = [
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
      sincronizarProdutos();
    }
    atualizarProdutos();
  });
  
  database.ref('relatorio').once('value').then((snapshot) => {
    const dados = snapshot.val();
    if (dados) {
      relatorio = Object.values(dados);
      atualizarRelatorio();
    }
  });
}

function sincronizarProdutos() {
  const produtosRef = database.ref('produtos');
  produtosRef.set(produtos.reduce((acc, produto) => {
    acc[produto.id] = produto;
    return acc;
  }, {}));
}

function sincronizarRelatorio() {
  const relatorioRef = database.ref('relatorio');
  relatorioRef.set(relatorio.reduce((acc, pedido, index) => {
    acc[index] = pedido;
    return acc;
  }, {}));
}

// === SISTEMA DE ALERTAS ===
function mostrarAlerta(mensagem, tipo = 'info') {
  const container = document.getElementById('alertasContainer');
  const alerta = document.createElement('div');
  alerta.className = `alerta ${tipo}`;
  alerta.innerHTML = `
    <span>${mensagem}</span>
    <button onclick="this.parentElement.remove()" class="btn-fechar">×</button>
  `;
  
  container.appendChild(alerta);
  
  // Auto-remover após 5 segundos
  setTimeout(() => {
    if (alerta.parentElement) {
      alerta.remove();
    }
  }, 5000);
}

// === FUNÇÕES DO GERENCIADOR DE PRODUTOS ===
function abrirGerenciadorProdutos() {
  document.getElementById('modalGerenciadorProdutos').style.display = 'flex';
  carregarListaProdutos();
  document.getElementById('produtoForm').reset();
  editandoProdutoId = null;
  document.querySelector('.btn-adicionar').textContent = 'Adicionar Produto';
}

function fecharGerenciadorProdutos() {
  document.getElementById('modalGerenciadorProdutos').style.display = 'none';
}

function carregarListaProdutos() {
  const lista = document.getElementById('listaProdutos');
  lista.innerHTML = '';
  
  produtos.forEach(prod => {
    const item = document.createElement('div');
    item.className = 'produto-item-list';
    item.innerHTML = `
      <div class="produto-info">
        <div class="produto-nome-list">${prod.nome}</div>
        <div class="produto-detalhes">${prod.categoria} • ID: ${prod.id}</div>
      </div>
      <div class="produto-preco-list">R$ ${prod.preco.toFixed(2)}</div>
      <div class="produto-acoes">
        <button class="btn-editar" onclick="editarProduto(${prod.id})">Editar</button>
        <button class="btn-excluir-prod" onclick="confirmarExclusaoProduto(${prod.id})">Excluir</button>
      </div>
    `;
    lista.appendChild(item);
  });
}

function salvarProduto(e) {
  e.preventDefault();
  
  const nome = document.getElementById('produtoNome').value.trim();
  const preco = parseFloat(document.getElementById('produtoPreco').value);
  const categoria = document.getElementById('produtoCategoria').value.trim().toLowerCase() || 'geral';
  const categoriaSelect = document.getElementById('produtoCategoriaSelect').value;
  const categoriaFinal = categoriaSelect === 'outro' ? categoria : categoriaSelect;
  
  // Validações
  if (!nome) {
    mostrarAlerta('Por favor, informe o nome do produto.', 'erro');
    return;
  }
  
  if (isNaN(preco) || preco <= 0) {
    mostrarAlerta('Por favor, informe um preço válido.', 'erro');
    return;
  }
  
  if (editandoProdutoId) {
    // Editar produto existente
    const index = produtos.findIndex(p => p.id === editandoProdutoId);
    if (index !== -1) {
      if (!confirm(`Tem certeza que deseja alterar o produto "${produtos[index].nome}"?\nEsta alteração afetará todos os dispositivos conectados.`)) {
        return;
      }
      
      produtos[index] = { ...produtos[index], nome, preco, categoria: categoriaFinal };
      mostrarAlerta('Produto atualizado com sucesso!', 'sucesso');
    }
  } else {
    // Adicionar novo produto
    const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
    produtos.push({ id: novoId, nome, preco, categoria: categoriaFinal });
    mostrarAlerta('Produto adicionado com sucesso!', 'sucesso');
  }
  
  sincronizarProdutos();
  document.getElementById('produtoForm').reset();
  carregarListaProdutos();
  editandoProdutoId = null;
  document.querySelector('.btn-adicionar').textContent = 'Adicionar Produto';
  atualizarProdutos();
}

function editarProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  
  document.getElementById('produtoNome').value = produto.nome;
  document.getElementById('produtoPreco').value = produto.preco;
  
  // Configurar select de categoria
  const categoriasExistentes = [...new Set(produtos.map(p => p.categoria))];
  const select = document.getElementById('produtoCategoriaSelect');
  
  if (categoriasExistentes.includes(produto.categoria)) {
    select.value = produto.categoria;
    document.getElementById('produtoCategoria').style.display = 'none';
  } else {
    select.value = 'outro';
    document.getElementById('produtoCategoria').style.display = 'block';
    document.getElementById('produtoCategoria').value = produto.categoria;
  }
  
  editandoProdutoId = id;
  document.querySelector('.btn-adicionar').textContent = 'Atualizar Produto';
  document.getElementById('produtoNome').focus();
}

function confirmarExclusaoProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  
  if (!confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?\nEsta ação afetará todos os dispositivos conectados e não pode ser desfeita.`)) {
    return;
  }
  
  // Verificar se o produto está em algum pedido ativo
  const emPedido = pedido.some(item => item.id === id);
  if (emPedido) {
    mostrarAlerta('Não é possível excluir um produto que está em um pedido ativo.', 'erro');
    return;
  }
  
  produtos = produtos.filter(p => p.id !== id);
  sincronizarProdutos();
  mostrarAlerta('Produto excluído com sucesso!', 'sucesso');
  carregarListaProdutos();
  atualizarProdutos();
}

function toggleCategoriaInput() {
  const select = document.getElementById('produtoCategoriaSelect');
  const input = document.getElementById('produtoCategoria');
  input.style.display = select.value === 'outro' ? 'block' : 'none';
}

// === FUNÇÕES ORIGINAIS DO SISTEMA ===
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
    doce: document.getElementById('doces'),
    geral: document.getElementById('doces') // Fallback para categorias personalizadas
  };
  
  Object.values(categorias).forEach(div => {
    if (div) div.innerHTML = '';
  });

  produtos.forEach(prod => {
    const categoria = prod.categoria in categorias ? prod.categoria : 'geral';
    const div = categorias[categoria];
    if (!div) return;
    
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
  const formaPagamento = document.getElementById('formaPagamento').value;
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
    <p style="font-weight:bold">Forma de Pagamento: ${formaPagamento}</p>
    <p style="text-align:right;font-weight:bold">TOTAL: R$ ${pedido.reduce((s, p) => s + p.qtd * p.preco, 0).toFixed(2)}</p>
    <script>setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},500)</script>
    </body></html>
  `);
  win.document.close();

  relatorio.push({
    data: new Date().toLocaleString(),
    cliente: nome,
    formaPagamento: formaPagamento,
    itens: [...pedido],
    total: pedido.reduce((s, p) => s + p.qtd * p.preco, 0)
  });
  sincronizarRelatorio();
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
        <strong>Forma de Pagamento:</strong> ${r.formaPagamento}<br>
        <strong>Total:</strong> R$ ${r.total.toFixed(2)}
        <button class="btn-excluir" onclick="excluirPedidoRelatorio(${i})">Excluir</button>
      </div><br>
    `;
  }).join('');

  document.getElementById('relatorioTotal').textContent = `Total do Dia: R$ ${total.toFixed(2)}`;
}

function excluirPedidoRelatorio(index) {
  if (confirm("Tem certeza que deseja excluir este pedido do relatório?")) {
    relatorio.splice(index, 1);
    sincronizarRelatorio();
    atualizarRelatorio();
  }
}

function imprimirRelatorio() {
  if (relatorio.length === 0) return alert("Nenhum pedido registrado!");
  const win = window.open('', 'Relatorio', 'width=800,height=600');
  win.document.write(`
    <html><head><style>body{font-family:Arial;padding:20px}.pedido{margin-bottom:20px;border-bottom:1px dashed #ccc}.total{font-weight:bold}</style></head><body>
    <h1 style="text-align:center">Relatório Completo do Dia</h1>
    ${relatorio.map((p, i) => `
      <div class="pedido">
        <strong>Pedido #${i+1}</strong><br>
        ${p.data} - ${p.cliente}<br>
        ${p.itens.map(it => `${it.qtd}x ${it.nome} - R$ ${(it.qtd * it.preco).toFixed(2)}`).join('<br>')}<br>
        <strong>Forma de Pagamento:</strong> ${p.formaPagamento}<br>
        <div class="total">Total: R$ ${p.total.toFixed(2)}</div>
      </div>
    `).join('')}
    <div class="total" style="margin-top:20px;font-size:1.2em">
      TOTAL DO DIA: R$ ${relatorio.reduce((acc, p) => acc + p.total, 0).toFixed(2)}
    </div>
    <script>setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},500)</script>
    </body></html>
  `);
  win.document.close();
}

function imprimirRelatorioResumido() {
  if (relatorio.length === 0) return alert("Nenhum pedido registrado!");
  
  // Calcular totais por produto
  const resumoProdutos = {};
  relatorio.forEach(pedido => {
    pedido.itens.forEach(item => {
      if (!resumoProdutos[item.nome]) {
        resumoProdutos[item.nome] = {
          quantidade: 0,
          total: 0,
          preco: item.preco
        };
      }
      resumoProdutos[item.nome].quantidade += item.qtd;
      resumoProdutos[item.nome].total += item.qtd * item.preco;
    });
  });
  
  // Calcular totais por forma de pagamento
  const resumoPagamentos = {};
  relatorio.forEach(pedido => {
    if (!resumoPagamentos[pedido.formaPagamento]) {
      resumoPagamentos[pedido.formaPagamento] = 0;
    }
    resumoPagamentos[pedido.formaPagamento] += pedido.total;
  });
  
  const win = window.open('', 'RelatorioResumido', 'width=800,height=600');
  win.document.write(`
    <html><head><style>
      body{font-family:Arial;padding:20px}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}
      th{background-color:#f2f2f2}
      .total{font-weight:bold;margin-top:20px}
    </style></head>
    <body>
    <h1 style="text-align:center">Relatório Resumido do Dia</h1>
    
    <h2>Resumo por Produto</h2>
    <table>
      <tr>
        <th>Produto</th>
        <th>Quantidade</th>
        <th>Preço Unitário</th>
        <th>Total</th>
      </tr>
      ${Object.entries(resumoProdutos).map(([nome, dados]) => `
        <tr>
          <td>${nome}</td>
          <td>${dados.quantidade}</td>
          <td>R$ ${dados.preco.toFixed(2)}</td>
          <td>R$ ${dados.total.toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>
    
    <h2>Resumo por Forma de Pagamento</h2>
    <table>
      <tr>
        <th>Forma de Pagamento</th>
        <th>Total</th>
      </tr>
      ${Object.entries(resumoPagamentos).map(([forma, total]) => `
        <tr>
          <td>${forma}</td>
          <td>R$ ${total.toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>
    
    <div class="total" style="margin-top:20px;font-size:1.2em">
      TOTAL GERAL: R$ ${relatorio.reduce((acc, p) => acc + p.total, 0).toFixed(2)}
    </div>
    
    <script>setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},500)</script>
    </body></html>
  `);
  win.document.close();
}

function exportarRelatorioPDF() {
  if (relatorio.length === 0) return alert("Nenhum pedido registrado!");
  alert("Funcionalidade de PDF será implementada em breve!");
}

function limparRelatorio() {
  if (!confirm("Tem certeza que deseja limpar o relatório?")) return;
  relatorio = [];
  sincronizarRelatorio();
  atualizarRelatorio();
}

// Inicializa ao carregar
window.onload = () => {
  // Inicializar Firebase e sincronização
  inicializarSincronizacao();
  
  // Inicializar categorias no select
  const categoriasExistentes = [...new Set(produtos.map(p => p.categoria))];
  const select = document.getElementById('produtoCategoriaSelect');
  
  // Manter as opções padrão e adicionar categorias existentes
  categoriasExistentes.forEach(cat => {
    if (!['salgado', 'bebida', 'doce', 'outro'].includes(cat)) {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    }
  });
  
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
  const todosInputs = document.querySelectorAll('input[type="text"][id="nomeCliente"]');
  const inputCorreto = document.querySelector('.controles-pedido .input-estilizado');
  
  todosInputs.forEach(input => {
    if (input !== inputCorreto) {
      input.remove();
    }
  });
  
  if (inputCorreto) {
    inputCorreto.style.display = 'block';
    inputCorreto.classList.add('input-estilizado');
  }
}

// Executa quando a página carrega e após 1 segundo (dupla verificação)
document.addEventListener('DOMContentLoaded', corrigirInputCliente);
setTimeout(corrigirInputCliente, 1000);