App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: () => {
        return App.initWeb3();
    },

    initWeb3: async () => {
        if (window.ethereum === undefined) {
            alert('Please install metamask.');
        } else {
            if (window.ethereum) {
                App.web3Provider = window.ethereum;
                web3 = new Web3(window.ethereum);
            } else if (window.web3) {
                App.web3Provider = window.ethereum;
                web3 = new Web3(window.ethereum);
            } else {
                App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
                web3 = new Web3(App.web3Provider);
            }
            return App.initContracts();
        }
    },

    initContracts: async () => {
        const id = await web3.eth.net.getId();
        const accounts = await web3.eth.getAccounts();
        App.account = accounts[0];

        $.getJSON("DappTokenSale.json", (register) => {
            const deployedNetwork = register.networks[id];
            App.contracts.DappTokenSale = new web3.eth.Contract(
                register.abi,
                deployedNetwork && deployedNetwork.address);

            listenToEvents();

        }).done(() => {
            $.getJSON("DappToken.json", (dappToken) => {
                const deployedNetwork = dappToken.networks[id];
                App.contracts.DappToken = new web3.eth.Contract(
                    dappToken.abi,
                    deployedNetwork && deployedNetwork.address);
                return App.render();
            });
        })

    },

    render: async () => {
        if (App.loading) {
            return;
        }
        App.loading = true;
        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();


        // load account data
        var accounts = await web3.eth.getAccounts();
        App.account = accounts[0]
        $('#accountAddress').html('Your account: ' + App.account);

        tokenPrice = await App.contracts.DappTokenSale.methods.tokenPrice().call();
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.utils.fromWei(App.tokenPrice, 'ether'));
        tokensSold = await App.contracts.DappTokenSale.methods.tokensSold().call();

        App.tokensSold = tokensSold;
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');

        balance = await App.contracts.DappToken.methods.balanceOf(App.account).call()
        $('.dapp-balance').html(balance);
        App.loading = false;
        loader.hide();
        content.show();
        return;
    },

    buyTokens: async () => {
        $('#content').hide();
        $('#loader').show();

        var numberOfTokens = $('#numberOfTokens').val();

        try {
            await App.contracts.DappTokenSale.methods.buyTokens(numberOfTokens).send({
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            })
                .once('sending', (payload) => { console.log('sending', payload) })
                .once('sent', (payload) => { console.log('sent', payload) })
                .once('transactionHash', (hash) => { console.log('transactionHash', hash) })
                .once('receipt', (receipt) => { console.log('receipt', receipt) })
                .once('confirmation', (confNumber, receipt, latestBlockHash) => { console.log('confirmation', confNumber, receipt, latestBlockHash) })
                .on('error', (error) => { console.error('error', error) })

        } catch (err) {
            console.error(err)
            App.render();
        }
    },
}

function listenToEvents() {
    App.contracts.DappTokenSale.events.Sell({})
        .on('data', async (event) => {
            console.warn(event)
            App.render();
        })
        .on('error', console.error);
}

// on change of networks, just reload recommended.
window.ethereum.on('chainChanged', handleChainChanged);
function handleChainChanged(_chainId) {
    window.location.reload();
}

window.ethereum.on('accountsChanged', handleAccountsChanged);
function handleAccountsChanged(accounts) {
    console.warn(accounts)
    if (accounts.length === 0) {
        alert('Please connect to metamask.')
        // MetaMask is locked or the user has not connected any accounts
    } else {
        App.account = accounts[0];
        App.render();
    }
}

$(function () {
    $(window).load(() => {
        App.init();
    })
})