// Configurações de Autenticação exigidas
const AUTH_USER = "slmc";
const AUTH_PASS = "slmceva";

// Banco de dados local (Array de transações)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Verificar se o usuário já estava logado antes (para não deslogar ao atualizar a página)
window.onload = function() {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }
}

// Controle de Login
function handleLogin() {
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    if (userIn === AUTH_USER && passIn === AUTH_PASS) {
        sessionStorage.setItem('isLoggedIn', 'true');
        errorMsg.innerText = "";
        showDashboard();
    } else {
        errorMsg.innerText = "Usuário ou senha incorretos!";
    }
}

function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    document.getElementById('main-dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    updateUI();
}

// Adicionar Transação (Ganho ou Gasto)
function addTransaction(type) {
    const descInput = document.getElementById(`${type}-desc`);
    const valInput = document.getElementById(`${type}-value`);
    
    const description = descInput.value.trim();
    const value = parseFloat(valInput.value);

    if (!description || isNaN(value) || value <= 0) {
        alert("Por favor, preencha os campos com valores válidos.");
        return;
    }

    const transaction = {
        id: Date.now(),
        description: description,
        value: value,
        type: type,
        date: new Date().toLocaleDateString('pt-BR')
    };

    transactions.push(transaction);
    saveData();
    updateUI();

    // Limpar campos
    descInput.value = "";
    valInput.value = "";
}

// Deletar uma transação errada
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateUI();
}

// Salvar no localStorage do navegador
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Atualizar toda a interface (Cards e Tabela)
function updateUI() {
    let totalIncome = 0;
    let totalExpenses = 0;
    const historyTable = document.getElementById('transaction-history');
    
    historyTable.innerHTML = "";

    // Renderiza as linhas de trás para frente (mais recente primeiro)
    [...transactions].reverse().forEach(t => {
        if (t.type === 'income') totalIncome += t.value;
        if (t.type === 'expense') totalExpenses += t.value;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td><span class="badge ${t.type}">${t.type === 'income' ? 'Ganho' : 'Gasto'}</span></td>
            <td style="color: ${t.type === 'income' ? 'var(--income)' : 'var(--expense)'}">
                ${t.type === 'income' ? '+' : '-'} R$ ${t.value.toFixed(2)}
            </td>
            <td><button onclick="deleteTransaction(${t.id})" class="delete-btn">Excluir</button></td>
        `;
        historyTable.appendChild(row);
    });

    const netProfit = totalIncome - totalExpenses;

    // Atualizar Cards com formatação de moeda
    document.getElementById('total-income').innerText = `R$ ${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').innerText = `R$ ${totalExpenses.toFixed(2)}`;
    
    const profitCard = document.getElementById('net-profit');
    profitCard.innerText = `R$ ${netProfit.toFixed(2)}`;
    
    // Mudar a cor do lucro se estiver negativo
    if (netProfit >= 0) {
        profitCard.style.color = "var(--income)";
    } else {
        profitCard.style.color = "var(--expense)";
    }
}