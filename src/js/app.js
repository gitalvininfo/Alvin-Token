App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function () {
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
            App.contracts.DappTokenSale = new web3.eth.Contract(register.abi, deployedNetwork.address);
        }).done(() => {
            $.getJSON("DappToken.json", (dappToken) => {
                const deployedNetwork = dappToken.networks[id];
                App.contracts.DappToken = new web3.eth.Contract(dappToken.abi, deployedNetwork.address);
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
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                App.account = account;
                $('#accountAddress').html('Your account: ' + account);
            }
        })

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
        console.warn(balance)
        $('.dapp-balance').html(balance);
        App.loading = false;
        loader.hide();
        content.show();
        return;
    },

    buyTokens: function () {

        $('#content').hide();
        $('#loader').show();

        var numberOfTokens = $('#numberOfTokens').val();
        console.warn(numberOfTokens);
        // return;

        App.contracts.DappTokenSale.methods.buyTokens(numberOfTokens).send({
            from: App.account,
            value: numberOfTokens * App.tokenPrice,
            gas: 500000
        })
            .on('receipt', receipt => {
                console.log('receipt 1', receipt)
                App.render()
            });
    },
}

// on change of networks, just reload recommended.
window.ethereum.on('chainChanged', handleChainChanged);
function handleChainChanged(_chainId) {
    window.location.reload();
}

$(function () {
    $(window).load(function () {
        App.init();
    })
})