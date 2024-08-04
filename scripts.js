function generateUUID() {
    return 'uuid_' + Math.random().toString(36).substring(2, 16);
}

function generateCSID() {
    return 'csid_' + Math.random().toString(36).substring(2, 16);
}

function setCSID() {
    if (typeof cdApi !== 'undefined') {
        let csid = localStorage.getItem('csid');
        if (!csid) {
            csid = generateCSID();
            localStorage.setItem('csid', csid);
        }
        cdApi.setCustomerSessionId(csid);
        return csid;
    } else {
        console.error('cdApi is not defined');
    }
}

//API context
function changeContext(contextName) {
    if (typeof cdApi !== 'undefined') {
        cdApi.changeContext(contextName);
    } else {
        console.error('cdApi is not defined');
    }
}

//API request
function triggerApiRequest(action, activityType, additionalData = {}) {
    const csid = localStorage.getItem('csid') || generateUUID();
    const payload = {
        customerId: "stepes",
        action: action,
        customerSessionId: csid,
        activityType: activityType,
        uuid: generateUUID(),
        brand: "SD",
        solution: "ATO",
        iam: "stesoa@outlook.com",
    };

    const proxyUrl = 'http://localhost:8080/proxy';
    const targetUrl = 'https://hooks.zapier.com/hooks/catch/1888053/bgwofce/';

    fetch(proxyUrl + '?url=' + encodeURIComponent(targetUrl), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-requested-with': 'xmlhttprequest'
        },
        body: JSON.stringify(payload)
    })
        
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    })
    .then(data => console.log(`Response from ${action}:`, data))
    .catch(error => console.error(`Error in ${action}:`, error));
}

document.addEventListener('DOMContentLoaded', () => {
    setCSID();

    const path = window.location.pathname;
    if (path.endsWith('index.html')) {
        changeContext('home_screen');
    } else if (path.endsWith('login.html')) {
        changeContext('login_screen');
    } else if (path.endsWith('account_overview.html')) {
        changeContext('account_overview_screen');
    } else if (path.endsWith('make_payments.html')) {
        changeContext('make_payments_screen');
    } else if (path.endsWith('logout.html')) {
        changeContext('logout_screen');
        //Clear CSID
        localStorage.removeItem('csid');
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'steh' && password === 'password') {
                console.log('Logging in...');
                triggerApiRequest('init', 'LOGIN');
                
                const newCSID = generateCSID();
                localStorage.setItem('csid', newCSID);
                
                cdApi.setCustomerSessionId(newCSID);
                window.location.href = 'account_overview.html';
            } else {
                alert('Invalid login');
            }
        });
    }

    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = document.getElementById('amount').value;
            console.log('Processing payment of amount:', amount);
            triggerApiRequest('getScore', 'MAKE_PAYMENT', { amount: parseFloat(amount) });
            
            alert('Payment successful!');
        });
    }

    const addFundsForm = document.getElementById('addFundsForm');
    if (addFundsForm) {
        addFundsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = document.getElementById('fundAmount').value;
            console.log('Adding funds of amount:', amount);
            triggerApiRequest('getScore', 'ADD_FUNDS', { amount: parseFloat(amount) });

            alert('Funds added successfully!');
        });
    }
});