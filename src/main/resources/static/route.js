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
    
    
    
    
    
    
    'admindashboard': 'showAdminDashboard',
    'workspacedashboard': 'showDashboard',
    'contentdashboard':'showContentDashboard',
    'uploadContentDashboard': 'uploadContentDashboard',
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

/*var uploadContent = null;
router.on('route:uploadContentDashboard', function(){
	if(uploadContent == null){
		var uploadContent = new UploadContentDashboard ();
	}else{
		
	}
	uploadContent.render();
});*/

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

router.on('route:users', function(){
	userList.render();
});

