const html = document.querySelector("html")
const checkbox = document.querySelector("input[name=theme]")


const getStyle = (element, style) => 
    window
        .getComputedStyle(element)
        .getPropertyValue(style)

const initialColors = {
    bg: getStyle(html, "--bg"),
    card: getStyle(html, '--card'),
    head: getStyle(html, '--head'),
    table: getStyle(html, '--table'),
}

// DarkMode
const darkMode = {
    bg: "#222222",
    card: "#333333",
    table: "#333333",
    head: "#FFFFFF",
}

const transformKey = key => 
    "--" + key.replace (/([A-Z])/, "-$1").toLowerCase()

const changeColors = (colors) => {
    Object.keys (colors).map(key =>
        html.style.setProperty(transformKey(key), colors[key])
        )

}

checkbox.addEventListener("change", ({target}) => {
    target.checked ? changeColors (darkMode) : changeColors(initialColors)
}) 


// Transaction

const Modal = {
    open(){
      // Abrir modal
      // Adicionar a class active ao modal
      document
      .querySelector('.modal-overlay')
      .classList
      .add('active')
    },
  close (){
    document
    .querySelector('.modal-overlay')
    .classList
    .remove('active')
    }
  }

const Storage = {
    get () {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []

    },

    set(transaction){
        localStorage.setItem("dev.finances:transactions", JSON.
        stringify(transaction))



    }
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction) {
        Transaction.all.push(transaction);

        App.reload()
    },
    remove (index) {
        Transaction.all.splice(index, 1);
        App.reload()

    },

    incomes() {
        let income = 0;
        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(transaction => {
        // se ela for maior que zero
        if(transaction.amount > 0) {
        // somar a uma variável e retornar a variável
            income += transaction.amount;
        }
        })
        return income;
    },
    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
        if(transaction.amount < 0) {
            expense += transaction.amount;
        }
        })
        return expense;
    },
    total () {
        return Transaction.incomes() + Transaction.expenses();
    }

}

// Substituir os dados do HTML com os dados do JS

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
              <td class="description">${transaction.description}</td>
              <td class="${CSSclass}">${amount}</td>
              <td class="date">${transaction.date}</td>
              <td>
                <img onclick="Transaction.remove(${index})" src="./assets/assets/minus.svg" alt="Remover transação" />
              </td>
              `
              return html
    },

    updateBalance () {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields() {
        const {description, amount, date} = Form.getValues()

        if(
            description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues () {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""

    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.FormatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
        

        Form.formatData()

    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload () {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
