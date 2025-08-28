
const produtos = [
  { id: 1, nome: "Pastel", preco: 5.00, categoria: "salgado" },
  { id: 2, nome: "Mini pizza", preco: 5.00, categoria: "salgado" },
  { id: 3, nome: "Refrigerante", preco: 2.00, categoria: "bebida" },
  { id: 4, nome: "Espetinho", preco: 5.00, categoria: "salgado" },
  { id: 5, nome: "Alimentação", preco: 10.00, categoria: "salgado" },
  { id: 6, nome: "Salgado", preco: 5.00, categoria: "salgado" }
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
  const formaPagamento = document.getElementById('formaPagamento').value;
  const win = window.open('', 'Nota', 'width=300,height=600');

  let blocos = '';
  pedido.forEach(p => {
    for (let i = 0; i < p.qtd; i++) {
      blocos += `
        <div class="bloco">
          <h3 style="text-align:center">•<br>NOSSA SENHORA DO LIVRAMENTO</h3>
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
    localStorage.setItem('relatorioPedidos', JSON.stringify(relatorio));
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
  
  // Usando a biblioteca jsPDF (precisa ser incluída)
  if (typeof jsPDF === 'undefined') {
    // Carregar a biblioteca jsPDF dinamicamente
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
      gerarPDF();
    };
    document.head.appendChild(script);
  } else {
    gerarPDF();
  }
  
  function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text("Relatório do Dia - Lanchonete Mises", 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, 22, { align: 'center' });
    
    let y = 30;
    
    // Lista de pedidos
    relatorio.forEach((pedido, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Pedido #${index + 1}`, 14, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.text(`Cliente: ${pedido.cliente}`, 14, y);
      y += 5;
      doc.text(`Data: ${pedido.data}`, 14, y);
      y += 5;
      doc.text(`Forma de Pagamento: ${pedido.formaPagamento}`, 14, y);
      y += 7;
      
      // Itens do pedido
      pedido.itens.forEach(item => {
        doc.text(`- ${item.qtd}x ${item.nome}: R$ ${(item.qtd * item.preco).toFixed(2)}`, 20, y);
        y += 5;
      });
      
      doc.setFontSize(12);
      doc.text(`Total: R$ ${pedido.total.toFixed(2)}`, 14, y);
      y += 10;
      
      // Linha separadora
      doc.line(14, y, 196, y);
      y += 5;
    });
    
    // Total do dia
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`TOTAL DO DIA: R$ ${relatorio.reduce((acc, p) => acc + p.total, 0).toFixed(2)}`, 14, y);
    
    // Salvar o PDF
    doc.save(`relatorio-mises-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
  }
}

function limparRelatorio() {
  if (!confirm("Tem certeza que deseja limpar o relatório?")) return;
  relatorio = [];
  localStorage.removeItem('relatorioPedidos');
  atualizarRelatorio();
}

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
  corrigirInputCliente();
};

// Executa quando a página carrega e após 1 segundo (dupla verificação)
document.addEventListener('DOMContentLoaded', corrigirInputCliente);
setTimeout(corrigirInputCliente, 1000);







