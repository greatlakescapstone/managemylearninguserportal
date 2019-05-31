
var Home = Backbone.View.extend({
	el:'.page',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('home-template'));
		
		
		var config = new Config();
		config.fetch({
			success: function (config){
				console.log(" config = %o", config.models)
				_config.init(config.models[0]);
				
				
				
				

				that.$el.html(template);	
				
				
			},
			error: function(){
				console.log("some problem accessing server");	
				

				that.$el.html(template);	
			}
		});
		
		
		
		
		
		
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
						DYNAMODB.queryTable("userId", _config.userId,
								null, null, _config.cognito.dynamodb.useraccounts,{
							
							onSuccess:function(userItems){
								
								_config.user = userItems.Items[0];
								_config.myWSContentTag = "@"+_config.user.workspace + "@";
								
								router.navigate('showUserDashboard', {
									trigger : true
								});
							},
							onFailure(err){
								alert("Could not login. failed to create session");
							}
							
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
		'click #manageMyBilling' : 'showMyBilling'
			
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
		router.navigate('showMyFilesPanel', {trigger:true})
		return false;
	},
	showMyWallet: function(ev){
		router.navigate('showMyWallet', {trigger:true})
		return false;
	},
	showMyBilling: function(ev){
		router.navigate('showMyBilling', {trigger:true})
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





var ContentDashboard = Backbone.View.extend({
	el:'.dashboardcontent',
	render: function(){
		
		var that = this
		var template  =_.template(tpl.get('subscribecontent-template'));
		that.$el.html(template);	
		
	},
	events: {
		'submit .searchContentByTags' : 'searchContentByTags',
		'click  #uploadNewContent': 'uploadNewContent'
	},
	
	searchContentByTags: function (ev) {
			ev.preventDefault();
			var data = $(ev.currentTarget).serializeObject();
			window.currentSearchCriteria = data.searchByTags;
			var contentResultTable = new SearchContentResultTable();
			
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
			onFailure: function(){}  
		});
		
	},
	events: {
		'click #subscribeLink' : 'subscribeLink'
		
			
	}, 
	subscribeLink: function(ev){
		ev.preventDefault();
		try{
			var data = $(ev.currentTarget).attr( 'data-content' );
			var subscriptionmodel = $(ev.currentTarget).attr( 'subscription-model' );
			console.log("subscribe for %o" + data);
			var arr = data.split(",");
			
			var jsonData = {userId:arr[0],category:arr[1],
                    content_title:arr[2],author:arr[3],
                    preview:arr[4],price:arr[5],link:arr[6]};
			
			
			
			DYNAMODB.subscribeToContent(jsonData, subscriptionmodel, {
				onSuccess(data){alert("Subscripiton Sucessful")},
				onFailure(err){}
			});			
		}catch(e){console.log(e);}
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
			onFailure: function(){}  
		});
		
	},
	events: {
		'click #videoLink' : 'setVideoLink',
		'submit .commentForm' : 'updateReview'
	}, 
	updateReview: function(ev){
		ev.preventDefault();
		try{
			
			var data= $(ev.currentTarget).serializeObject();
			console.log("subscribe for " + data);
			DYNAMODB.updateContentReview(data.comment, data.rating, data.content_title, {
				
				onSuccess:function(){},
				onFailure:function(e){alert(e);}
				
			});
			
		}catch(e){console.log(e);}
		return false;
	},
	setVideoLink: function(ev){
		 console.log("video data %o", ev);
		 var link= $(ev.currentTarget).attr( 'contentlink' );
		 var contenttitle= $(ev.currentTarget).attr( 'contenttitle' );
		 var contentprice= $(ev.currentTarget).attr( 'contentprice' );
		 if(link ){
			
			if(link.match(_config.videoExtRegExPattern)){
				window.currentVideoLink = link;
				window.runningContentMinutePrice = contentprice;
				window.content_title = contenttitle;
				
				
				var video;
				if(link.match(_config.videoStreamingRegExPattern)){
					
					if(videoStreamingPane != null){
						try{videoStreamingPane.dispose()}catch(e){console.log(e);}
					}
					videoStreamingPane = new VideoStreamingPane();
						
					
					video = videoStreamingPane;
				}else{
					if(videoPane != null){
						try{videoPane.dispose()}catch(e){console.log(e);}
					}
					videoPane = new VideoPane();
				
					video = videoPane;
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
		 
	 }
	
});


var videoPane = null;
var VideoPane = Backbone.View.extend({
	el:'.videocontainer',
	render: function(){
		var that = this;
		var template  =_.template(tpl.get('video-template'));
		var data = {videolink:window.currentVideoLink}
		that.$el.html(template(data));
		
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



var myFilesPanel;
var MyFilesPanel = Backbone.View.extend({
	el:'.dashboardcontent',
	render: function(){
		
		var that = this

		DYNAMODB.searchContentByTags(  _config.myWSContentTag, {
			onSuccess: function(data){
				var fileItems = data;
				var template  =_.template(tpl.get('myfiles-template'));
				var templateData = {fileItems: fileItems}
				that.$el.html(template(templateData));
				window.popover();

			},
			onFailure: function(){}  
		});
		
	},
	events: {
		'click .uploadNewContent':'uploadNewContent',
		'click #videoLink' : 'setVideoLink',
		'click #publishLink': 'publishLink'
			
	},
	uploadNewContent: function(){
		router.navigate("uploadNewContent", {trigger:true});
		return false;
	},
	publishLink: function(ev){
		var contentId = $(ev.currentTarget).attr( 'contenttitle' );
		AppController.publishMyContent(contentId, {
			
			onSuccess:function(){},
			onFailure:function(){}
		});
		
		return false;
	},
	setVideoLink: function(ev){
		 console.log("video data %o", ev);
		 var link= $(ev.currentTarget).attr( 'contentlink' );
		 var contenttitle= $(ev.currentTarget).attr( 'contenttitle' );
		 var contentprice= $(ev.currentTarget).attr( 'contentprice' );
		 if(link ){
			
			if(link.match(_config.videoExtRegExPattern)){
				window.currentVideoLink = link;
				window.runningContentMinutePrice = 0;
				window.content_title = contenttitle;
				
				
				var video;
				if(link.match(_config.videoStreamingRegExPattern)){
					
					if(videoStreamingPane != null){
						try{videoStreamingPane.dispose()}catch(e){console.log(e);}
					}
					videoStreamingPane = new VideoStreamingPane();
						
					
					video = videoStreamingPane;
				}else{
					if(videoPane != null){
						try{videoPane.dispose()}catch(e){console.log(e);}
					}
					videoPane = new VideoPane();
				
					video = videoPane;
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
		 
	 }
});




var WalletPanel = Backbone.View.extend({
	el:'.dashboardcontent',
	render: function(){
		var that = this;
		
		
		var that = this
		var searchOptionData = window.currentSearchCriteria
		DYNAMODB.queryTable("userid", _config.userId,
				null, null, _config.cognito.dynamodb.userwallet,{
			onSuccess: function(walletItems){
				
				var walletItem = walletItems.Items[0];
				
				
				var balance = 0;
				if(walletItem){
					balance = (parseFloat(walletItem.cumulativeCredit) - parseFloat(walletItem.cumulativeDebit));
					
				}
				var template  =_.template(tpl.get('wallet-template'))
				var templateData = {data: {currentbalance:balance}}
				that.$el.html(template(templateData));
				
				
				
				creditRecordsTable = new CreditRecordsTable();
				
				creditRecordsTable.render();
			},
			onFailure: function(){}  
		});
		
	
	},
	events: {
		'submit .wallet-form': 'addToWallet'
	},
	addToWallet: function(ev){
		
				var walletDetails = $(ev.currentTarget).serializeObject();
				DYNAMODB.addToWallet(_config.userId, walletDetails.creditamount, "credit transfer",  {
					onSuccess:function(data){
						
						creditRecordsTable.render();
						
						var ele = document.getElementById("walletBalanceValueLbl");
						ele.innerHTML = "Current Balance: " + data.newBalance;
						
						
						creditRecordsTable.render();
						
						
					}, onFailure:function(err){
						
						alert("faile to add credit-" + err.message || JSON.stringify(err));
						
					}
				});	

		return false;
	},
	cancelSignIn: function(ev){
		router.navigate('home', {trigger:true})
		return false;
	}
});


var creditRecordsTable;
var CreditRecordsTable = Backbone.View.extend({
	el:'.walletRecordsTable',
	render: function(){
		
		var that = this

		DYNAMODB.queryTable("userid", _config.userId, null, null,  _config.cognito.dynamodb.usercredit, {
			onSuccess: function(data){
				var creditItems = data.Items;
				var template  =_.template(tpl.get('creditrecords-template'));
				var templateData = {creditRecords: creditItems}
				that.$el.html(template(templateData));

			},
			onFailure: function(){}  
		});
		
	},
	events: {
		
			
	}
});



var DebitRecordsTable = Backbone.View.extend({
	el:'.dashboardcontent',
	render: function(){
		
		var that = this

		DYNAMODB.queryTable("userid", _config.userId, null, null,  _config.cognito.dynamodb.userbilling, {
			onSuccess: function(data){
				var debitItems = data.Items;
				var template  =_.template(tpl.get('debitrecords-template'));
				var templateData = {debitRecords: debitItems}
				that.$el.html(template(templateData));

			},
			onFailure: function(){}  
		});
		
	},
	events: {
		
			
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
			
			AppController.postContentForSelf(loginDetails.newcategory, 
					loginDetails.newauthor,loginDetails.title,
					loginDetails.preview, loginDetails.price, loginDetails.oneTimePrice,
					loginDetails.tags, document.getElementById('file').files);

	  
	    return false;
	 }
});


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

