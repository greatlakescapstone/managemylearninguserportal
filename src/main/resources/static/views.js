
var Home = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('home-template'));
		that.$el.html(template);	
	},events: {
		'click #registerAsOrg' : 'registerAsOrg',
		'click #registerAsUser' : 'registerAsUser',
		'click #signInAsUser' : 'signInAsUser',
		'click #signInAsOrg' : 'signInAsOrg',
		'click #manageWorkspace' : 'showWorkspaceDashboard',
		'click #manageContents' : 'showContentDashoard'
			
	},
	registerAsOrg: function(ev){
		router.navigate('registerAsOrg', {trigger:true})
		return false;
	},
	registerAsUser: function(ev){
		router.navigate('registerAsUser', {trigger:true})
		return false;
	},
	signInAsUser: function(ev){
		router.navigate('signInAsUser', {trigger:true})
		return false;
	},
	signInAsOrg: function(ev){
		router.navigate('signInAsOrg', {trigger:true})
		return false;
	}
	 
});

var home = new Home();





var OrganisationRegistration = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('orgregistrationform-template'));

		that.$el.html(template);	
	},events: {
		'submit .orgregistrationform' : 'registerNewMMLWorkSpaceForOrganisation',
		'click #cancelRegistration' : 'cancelRegistration'
			
	},
	registerNewMMLWorkSpaceForOrganisation: function(ev){
		var data = $(ev.currentTarget).serializeObject();
		AppController.registerMMLWorksapceForOrganisation(data, {
			
			onSuccess:function(data){
				router.navigate('home', {trigger:true});
			},
			onFailure:function(err){
				alert(err);
			}
			
			
		})
		
		return false;
	},
	cancelRegistration: function(ev){
		router.navigate('home', {trigger:true})
		return false;
	}
	 
});

var organisationRegistration = new OrganisationRegistration();





var UserRegistration = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('userregistrationform-template'));
		
		that.$el.html(template);	
	},
	events: {
		'submit .userregistrationform' : 'registerMMLWorkspaceForaUser',
		'click #cancelRegistration' : 'cancelRegistration'
			
	},
	registerMMLWorkspaceForaUser: function(ev){
		var data = $(ev.currentTarget).serializeObject();
		data.gender = data.maleRadio?"male":"female";
		AppController.registerMMLWorkspaceForaUser(data, {
			
			onSuccess:function(data){
				router.navigate('home', {trigger:true});
			},
			onFailure:function(err){
				alert(err);
			}
			
			
		})
		
		return false;
	},
	cancelRegistration: function(ev){
		router.navigate('home', {trigger:true})
		return false;
	}
	 
});

var userRegistration = new UserRegistration();



var SignInAsUser = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('userloginform-template'))

		that.$el.html(template);	
	},
	events: {
		'submit .userloginform': 'signin',
		'click #cancelSignIn' : 'cancelSignIn'
	},
	signin: function(ev){
		
				var loginDetails = $(ev.currentTarget).serializeObject();
				COGNITO.login(loginDetails.userId, loginDetails.password, {
					onSuccess:function(){
						_config.userId = loginDetails.userId;
						router.navigate('showUserDashboard', {
							trigger : true
						});
						
					}, onFailure:function(err){
						
						alert(err.message || JSON.stringify(err));
						
					}
				});	

		return false;
	},
	cancelSignIn: function(ev){
		router.navigate('home', {trigger:true})
		return false;
	}
});

var signInAsUser = new SignInAsUser();


var SignInAsOrg = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('orgloginform-template'))

		that.$el.html(template);	
	},
	events: {
		'submit .orgloginform': 'signin',
		'click #cancelSignIn' : 'cancelSignIn'
	},
	signin: function(ev){
		
				var loginDetails = $(ev.currentTarget).serializeObject();
				COGNITO.login(loginDetails.orgId, loginDetails.password, {
					onSuccess:function(){
						_config.userId = loginDetails.orgId;
						router.navigate('showOrgDashboard', {
							trigger : true
						});
						
					}, onFailure:function(err){
						
						alert(err.message || JSON.stringify(err));
						
					}
				});	

		return false;
	},
	cancelSignIn: function(ev){
		router.navigate('home', {trigger:true})
		return false;
	}
});

var signInAsOrg = new SignInAsOrg();




var UserDashboard = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('userdashboard-template'));
		
		
		

		that.$el.html(template);	
	},events: {
		'click #logout' : 'logout',
		'click #manageMySubscriptions' : 'showMySubscriptions',
		'click #manageAddSubscription' : 'showAddSubscription',
		'click #manageMyPrivateWorkspace' : 'showPrivateWorkspace',
		'click #manageMyWallet' : 'showMyWallet',
		'click #manageyBilling' : 'shoMyBilling'
			
	},
	logout: function(ev){
		COGNITO.logout();
		router.navigate('', {trigger:true})
		return false;
	},
	showMySubscriptions: function(ev){
		router.navigate('showMySubscriptions', {trigger:true})
		return false;
	},
	showAddSubscription: function(ev){
		router.navigate('showAddSubscription', {trigger:true})
		return false;
	},
	showPrivateWorkspace: function(ev){
		router.navigate('workspacedashboard', {trigger:true})
		return false;
	},
	showMyWallet: function(ev){
		router.navigate('contentdashboard', {trigger:true})
		return false;
	},
	shoMyBilling: function(ev){
		router.navigate('contentdashboard', {trigger:true})
		return false;
	}
	 
});

var userDashboard = new UserDashboard();


var OrgDashboard = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('orgdashboard-template'));
		
		
		

		that.$el.html(template);	
	},events: {
		'click #logout' : 'logout',
		'click #dashboard' : 'showDashboard',
		'click #manageAdmins' : 'showAdminDashboard',
		'click #manageWorkspace' : 'showWorkspaceDashboard',
		'click #manageContents' : 'showContentDashoard'
			
	},
	logout: function(ev){
		COGNITO.logout();
		router.navigate('', {trigger:true})
		return false;
	},
	showDashboard: function(ev){
		router.navigate('dashboard', {trigger:true})
		return false;
	},
	showAdminDashboard: function(ev){
		router.navigate('admindashboard', {trigger:true})
		return false;
	},
	showWorkspaceDashboard: function(ev){
		router.navigate('workspacedashboard', {trigger:true})
		return false;
	},
	showContentDashoard: function(ev){
		router.navigate('contentdashboard', {trigger:true})
		return false;
	}
	 
});

var orgDashboard = new OrgDashboard();



var AdminDashboard = Backbone.View.extend({
	el:'.dashboardcontent',
	render: function(){
		var that = this;
		
		var admins = new Admins();
		admins.fetch({
			success: function (admins){
					var template  =_.template(tpl.get('admindashboard-template'));
					var data = {admins: admins.models}
					var element = document.getElementById("dashboardcontent");
					element.innerHTML = template(data);
			}
		});
		
	}
});
var adminDashoard = new AdminDashboard();

var ContentDashboard = Backbone.View.extend({
	el:'.dashboardcontent',
	render: function(){
		
		var that = this
		var template  =_.template(tpl.get('subscribecontent-template'));
		that.$el.html(template);	
		
	},
	events: {
		'submit .searchContentByTags' : 'searchContentByTags',
		'click .uploadNewContent': 'uploadNewContent'
	},
	
	searchContentByTags: function (ev) {
			ev.preventDefault();
			var data = $(ev.currentTarget).serializeObject();
			window.currentSearchCriteria = data.searchByTags;
			if(contentResultTable == null){
				
				contentResultTable = new SearchContentResultTable();
			}
			contentResultTable.render();
	  
	    return false;
	 },
	 searchContentByAuthorAndTitle: function (ev) {
			ev.preventDefault();
		

	  
	    return false;
	 },uploadNewContent: function (ev) {
			ev.preventDefault();
			router.navigate('uploadContentDashboard', {trigger:true});

	  
	    return false;
	 }
	
});


var SearchContentResultTable = Backbone.View.extend({
	el:'.contentSearchResult',
	render: function(){
		
		var that = this
		var searchOptionData = window.currentSearchCriteria
		DYNAMODB.searchContentByTags(searchOptionData, {
			onSuccess: function(data){
				var template  =_.template(tpl.get('searchcontentresult-template'));
				var templateData = {contents: data}
				that.$el.html(template(templateData));
				
				window.popover();
			},
			onFalure: function(){}  
		});
		
	},
	events: {
		'click #subscribeLink' : 'subscribeLink'
		//'click #videoLink' : 'setVideoLink'
			
	}, 
	subscribeLink: function(ev){
		ev.preventDefault();
		try{
			var data= $(ev.currentTarget).attr( 'data-content' );
			console.log("subscribe for " + data);
			var arr = data.split(",");
			
			var jsonData = {userId:arr[0],category:arr[1],
                    content_title:arr[2],author:arr[3],
                    preview:arr[4],price:arr[5],link:arr[6]};
			
			DYNAMODB.subscribeContent(jsonData, {
				onSuccess(data){},
				onFailure(err){}
			});			
		}catch(e){console.log(e);}
		return false;
	},
	setVideoLink: function(ev){
		 console.log("video data %o", ev);
		 var link= $(ev.currentTarget).attr( 'contentlink' );
		 if(link ){
			
			if(link.match(_config.videoExtRegExPattern)){
				window.currentVideoLink = link;
				if(videoPane == null){
					
					videoPane = new VideoPane();
				}
				try{
					videoPane.render();
					document.getElementById("autoClickModalVideo").click();
					
				}catch(e){
					console.log(e);
				}
			}else{
				window.open(link,"resizeable,scrollbar"); 
			}
			
			
		}else{
			console.log("no content link available");
		}
		
		
		return false;
		 
	 },	
	editContent: function (ev) {
		ev.preventDefault();

	  
	    return false;
	 }
	
});





var MySubscriptionsPanel = Backbone.View.extend({
	el:'.dashboardcontent',
	render: function(){
		
		var that = this
		var searchOptionData = window.currentSearchCriteria
		DYNAMODB.listMySubscriptions({
			onSuccess: function(data){
				var template  =_.template(tpl.get('mysubscriptions-template'));
				var templateData = {contents: data}
				that.$el.html(template(templateData));
				
				window.popover();
			},
			onFalure: function(){}  
		});
		
	},
	events: {
		'click #subscribeLink' : 'subscribeLink',
		'click #videoLink' : 'setVideoLink'
			
	}, 
	subscribeLink: function(ev){
		ev.preventDefault();
		try{
			var data= $(ev.currentTarget).attr( 'data-content' );
			console.log("subscribe for " + data);
			var arr = data.split(",");
			
			var jsonData = {userId:arr[0],category:arr[1],
                    content_title:arr[2],author:arr[3],
                    preview:arr[4],price:arr[5],link:arr[6]};
			
			DYNAMODB.subscribeContent(jsonData, {
				onSuccess(data){},
				onFailure(err){}
			});			
		}catch(e){console.log(e);}
		return false;
	},
	setVideoLink: function(ev){
		 console.log("video data %o", ev);
		 var link= $(ev.currentTarget).attr( 'contentlink' );
		 if(link ){
			
			if(link.match(_config.videoExtRegExPattern)){
				window.currentVideoLink = link;
				var video;
				if(link.match(_config.videoStreamingRegExPattern)){
					
					if(videoStreamingPane == null){
						
						videoStreamingPane = new VideoStreamingPane();
						video = videoStreamingPane;
					}
				}else{
					if(videoPane == null){
						
						videoPane = new VideoPane();
						video = videoPane;
					}
				}
				
				try{
					video.render();
					document.getElementById("autoClickModalVideo").click();
					
				}catch(e){
					console.log(e);
				}
			}else{
				window.open(link,"resizeable,scrollbar"); 
			}
			
			
		}else{
			console.log("no content link available");
		}
		
		
		return false;
		 
	 },	
	editContent: function (ev) {
		ev.preventDefault();

	  
	    return false;
	 }
	
});
var videoPane = null;
var VideoPane = Backbone.View.extend({
	el:'.videocontainer',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('video-template'));
		var data = {}
		that.$el.html(template());
		
	}
});

var videoStreamingPane = null;
var VideoStreamingPane = Backbone.View.extend({
	el:'.videocontainer',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('videostreaming-template'));
		var data = {}
		that.$el.html(template());
		
	}
});

var UploadContentDashboard = Backbone.View.extend({
	el:'.dashboardcontent',
	render: function(){
		
		var that = this
		var template  =_.template(tpl.get('newcontent-template'));
		//var data = {admins: admins.models}
		//var element = document.getElementById("dashboardcontent");
		//element.innerHTML = template();
		
		

		that.$el.html(template);	
	/*	$("form#content-form").submit(function(e) {
		    e.preventDefault();    
		    var formData = new FormData(this);

		    $.ajax({
		        url: "/content",
		        type: 'POST',
		        data: formData,
		        success: function (data) {
		            console.log ("Form submission success");
		        },
		        error: function(){
		        	console.log ("Form submission failure");
		        },
		        cache: false,
		        contentType: false,
		        processData: false
		    });
		});*/
		
	},
	events: {
		'submit .content-form' : 'upload'
			
	},
	
	upload: function (ev) {
			ev.preventDefault();
			var formData = new FormData($(ev.currentTarget));
			var loginDetails = $(ev.currentTarget).serializeObject();
			
			AppController.postContent(loginDetails.newcategory, 
					loginDetails.newauthor,loginDetails.title,
					loginDetails.preview, loginDetails.price, 
					loginDetails.tags, document.getElementById('file').files);

	  
	    return false;
	 }
});




var UserList = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		
		var users = new Users();
		users.fetch({
			success: function (userList){
				
				
					var template  =_.template($('#user-list').html());
					var data = {users: userList.models}
					that.$el.html(template(data));
			}
		});
		
	}
});

var userList = new UserList();

