$.ajaxPrefilter(function(options, originalOptions, jqXHR){
	console.log("options.url =>", options.url)
	if(options.url.startsWith("template") 
			|| options.url.startsWith("http")){
		
	}else{
		options.url = "/api/v1" + options.url;
	}
	
	
});


var Router = Backbone.Router.extend({
  routes:{
    '':'home',
    'home':'home',
    'registerAsOrg':'registerAsOrg',
    'registerAsUser':'registerAsUser',  
    'signInAsUser': 'signInAsUser',
    'signInAsOrg':'signInAsOrg',
    'showUserDashboard':'showUserDashboard',
    'showOrgDashboard':'showOrgDashboard',   
    'showMySubscriptions':'showMySubscriptions',
    'showAddSubscription': 'showContentDashboard',
    'showMyFilesPanel': 'showMyFilesPanel',
    'uploadNewContent': 'uploadNewContent',
    'showMyWallet':'showMyWallet',
    'showMyBilling':'showMyBilling',
    
    
    
    
    
    'admindashboard': 'showAdminDashboard',
    'workspacedashboard': 'showDashboard',
    'contentdashboard':'showContentDashboard',
    
    'searchAndShowContentResults':'searchAndShowContentResults',
    'showUser': 'users'
  }

});
var router = new Router();
router.on('route:home', function(){
	home.render();
});

router.on('route:registerAsOrg', function(){
	organisationRegistration.render();
});

router.on('route:registerAsUser', function(){
	userRegistration.render();
});


router.on('route:signInAsUser', function(){
	signInAsUser.render();
});

router.on('route:signInAsOrg', function(){
	signInAsOrg.render();
});



router.on('route:showUserDashboard', function(){
	userDashboard.render();
});

router.on('route:showOrgDashboard', function(){
	orgDashboard.render();
});





var content = null;
router.on('route:showContentDashboard', function(){
	if(content == null){
		var content = new ContentDashboard ();
	}
	content.render();
});


var contentResultTable = null;
router.on('route:showAddSubscription', function(){
	if(contentResultTable == null){
		contentResultTable = new SearchContentResultTable();
	}else{
		
	}
	contentResultTable.render();
});



var mySubscriptionsPanel = null;
router.on('route:showMySubscriptions', function(){
	if(mySubscriptionsPanel == null){
		mySubscriptionsPanel = new MySubscriptionsPanel();
	}else{
		
	}
	mySubscriptionsPanel.render();
});


var showMyFilesPanel = null;
router.on('route:showMyFilesPanel', function(){
	if(showMyFilesPanel == null){
		var showMyFilesPanel = new MyFilesPanel ();
	}else{
		
	}
	showMyFilesPanel.render();
});

var uploadNewContent = null;
router.on('route:uploadNewContent', function(){
	if(uploadNewContent == null){
		var uploadNewContent = new UploadContentDashboard ();
	}else{
		
	}
	uploadNewContent.render();
});



var walletPanel = null;
router.on('route:showMyWallet', function(){
	if(walletPanel == null){
		walletPanel = new WalletPanel();
	}else{
		
	}
	walletPanel.render();
});


var debitRecordsTable = null;
router.on('route:showMyBilling', function(){
	if(debitRecordsTable == null){
		debitRecordsTable = new DebitRecordsTable();
	}else{
		
	}
	debitRecordsTable.render();
});

debitRecordsTable



router.on('route:users', function(){
	userList.render();
});

