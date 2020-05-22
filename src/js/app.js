App={
	web3Provider: null,
	contracts:{},
	account:'0x0',
	loading:false,
	tokenPrice: 0,
	tokensAvailable:750000,

	init: function(){
		console.log("app initialized");
		if(web3){
			console.log('web3 available');
		}
		return App.initWeb3();
	},

	initWeb3: ()=>{
		if(typeof web3 !== 'undefined'){
			App.web3Provider = web3.currentProvider;
		}
		else{
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
		}	
		web3 = new Web3(App.web3Provider);
		//App.web3Provider = new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws/v3/6a619c8c4fe347dcb763872165c77e02")
		
		//web3 = new Web3(App.web3Provider);
		return App.initContracts();
	},

	initContracts: ()=>{
		$.getJSON('SkvTokenSale.json',(skvTokenSale)=>{
			App.contracts.SkvTokenSale = TruffleContract(skvTokenSale);	
			App.contracts.SkvTokenSale.setProvider(App.web3Provider);
			App.contracts.SkvTokenSale.deployed().then(function(skvTokenSale){
				console.log("Skv Token Sale Address = ",skvTokenSale.address);
			})
		}).done(()=>{
			$.getJSON('SkvToken.json',(skvToken)=>{
				App.contracts.SkvToken = TruffleContract(skvToken);
				App.contracts.SkvToken.setProvider(App.web3Provider);
				App.contracts.SkvToken.deployed().then((skvToken)=>{
					console.log("Skv Token Contract Address = ", skvToken.address)
				})

				App.listenForEvents();
				return App.render();
			})			
		})
	},
	buyTokens: ()=>{
		$('#loader').show();
		$('#content').hide();
		var numberOfTokens = $('#numberOfTokens').val();
		App.contracts.SkvTokenSale.deployed().then(function(instance){
			return instance.buyTokens(numberOfTokens,{ 
				from : App.account, 
				value: numberOfTokens * App.tokenPrice, 
				gas: 500000
			}).then((result)=>{
				console.log("Tokens bought")
				$('.form').trigger('reset');
				//wait for sell event
			})
		})
	},
	listenForEvents:()=>{
		App.contracts.SkvTokenSale.deployed().then(function(instance){
			instance.Sell().on('data', event=>{
				console.log('event triggered');
				App.render();
			})
		})	
	},
	render: ()=>{
		//load account data
		if(App.loading){
			return;
		}
		App.loading = true;

		var loader = $('#loader');
		var content = $('#content');

		loader.show();
		content.hide();

		web3.eth.getCoinbase((error,account)=>{
			if(!error){
				console.log('account=', account);
				App.account = account;
				$('#accountAddress').html('Your Account Address : '+ account);
			}
		})

		App.contracts.SkvTokenSale.deployed().then((instance)=>{
			skvTokenSaleInstance = instance;
			return skvTokenSaleInstance.tokenPrice();
		}).then((tokenPrice)=>{
			App.tokenPrice = tokenPrice;
			console.log(web3.utils.fromWei(App.tokenPrice,'ether'));
			$('.token-price').html(web3.utils.fromWei(App.tokenPrice,'ether'));
			return skvTokenSaleInstance.tokenSold();
		}).then((tokenSold)=>{
			App.tokensSold = tokenSold.toNumber();
			$('.tokens-sold').html(App.tokensSold);
			$('.tokens-available').html(App.tokensAvailable);
		
			var progressPercent = Math.ceil(App.tokensSold * 100/ App.tokensAvailable) ;
			$('#progress').css('width',progressPercent+"%");
		
			App.contracts.SkvToken.deployed().then(function(instance){
				skvTokenInstance = instance;
				return skvTokenInstance.balanceOf(App.account);
			}).then((balance)=>{
				$('.skv-balance').html(balance.toNumber());
				App.loading = false;
				loader.hide();
				content.show();	
			})

		})
	}
}

$(function(){
	$(window).load(()=>{
		App.init();
	})
});