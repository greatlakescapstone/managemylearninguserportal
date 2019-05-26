var DYNAMODB = DYNAMODB || {}	
DYNAMODB = {
		dynamodb: null,
		docClient: null,
		init:function(){
			COGNITO.accessIdentityToken();
			// Create a service client with the provider
			dynamodb = new AWS.DynamoDB({region: _config.cognito.region});
			docClient = new AWS.DynamoDB.DocumentClient();
		},
		
		listTables:function(){
			var params = {};
		    dynamodb.listTables(params, function(err, data) {
			    if (err){
			        console.log("Unable to list tables:\n" + JSON.stringify(err, undefined, 2));
			    }
			    else{
			    	console.log("List of tables: \n" + JSON.stringify(data, undefined, 2));
			    }
		    });
		},
		createMMLWorkspace:function(orgId,workspaceName,orgName,phoneNumber,email, callback){
			var workspaceId = orgName+"_"+workspaceName;
			workspaceId = workspaceId.trim().toLowerCase().replace(" ","");
			
			var mmlWorkspaceItem = {
	        		"orgid":orgId,
			        "workspaceid": workspaceId,
			        "workspaceName":workspaceName,
		            "orgName": orgName,
		            "orgPhoneNumber": phoneNumber,
		            "masterEmail": email
			};
			
			var params = {
		        TableName :_config.cognito.dynamodb.mmlworkspace,
		        Item: mmlWorkspaceItem
		    };
		    docClient.put(params, function(err, data) {
		    	
		        if (err) {
		        	callback.onFailure(err);
		            
		        } else {
		        	callback.onSuccess(mmlWorkspaceItem);
		            
		        }
		    });
		},
		createOrgAccount:function(data, callback){
			var params = {
		        TableName :_config.cognito.dynamodb.orgaccounts,
		        Item: {
		        		"orgid":data.orgId,
				        "orgEmail": data.email,
				        "orgName": data.orgName,
				        "contactFirstName": data.contactPersonFirstName,
			            "contactLastName": data.contactPersonLastName,
			            "contactPhone": data.phoneNumber,
			            "contactAddrLine1": data.addressFirstLine,
			            "contactAddrLine2": data.address2ndLine,
			            "contactcity": data.city,
			            "contactState": data.state,
			            "contactCountry": data.country,
			            "contactZip": data.zip
				}
		    };
		    docClient.put(params, function(err, data) {
		    	
		        if (err) {
		        	callback.onFailure(err);
		            
		        } else {
		        	callback.onSuccess(data);
		            
		        }
		    });
		},
		createUserAccount:function(data, callback){
			var params = {
		        TableName :_config.cognito.dynamodb.useraccounts,
		        Item: {
		        		"userId":data.userId,
				        "email": data.email,
				        "firstName": data.firstName,
			            "lastName": data.lastName,
			            "contactPhone": data.phoneNumber,
			            "contactAddrLine1": data.addressFirstLine,
			            "contactAddrLine2": data.address2ndLine,
			            "contactcity": data.city,
			            "contactState": data.state,
			            "contactCountry": data.country,
			            "contactZip": data.zip,
			            "dob":data.dob,
			            "education":data.education,
			            "gender":data.gender,
			            "experience":data.experience,
			            "workspace": data.workspaceName
			            	
				}
		    };
		    docClient.put(params, function(err, data) {
		    	
		        if (err) {
		        	callback.onFailure(err);
		            
		        } else {
		        	callback.onSuccess(data);
		            
		        }
		    });
		},
		createContent: function (itemDetails, callback) {
		    var params = {
		        TableName :_config.cognito.dynamodb.contentTbl,
		        Item:itemDetails
		    };
		    docClient.put(params, function(err, data) {
		    	
		        if (err) {
		        	callback.onFailure(err);
		            
		        } else {
		        	callback.onSuccess(data);
		            
		        }
		    });
		},
		registerContentWithSearchTags: function(searchtags, contenttitle, callback){
			var params ; 
			var i;
			for(i=0; i<searchtags.length; i++){
				var tag = searchtags[i].trim().toLowerCase();
				params = {
				        TableName :_config.cognito.dynamodb.tagTbl,
				        Item:{
				            "content_tag": tag,
				            "content_title": contenttitle
				        }
				    };
				    docClient.put(params, function(err, data) {
				    	
				        if (err) {
				        	callback.onFailure(err);
				            
				        } else {
				        	callback.onSuccess(data);
				            
				        }
				    });
			}
			 
		},
		subscribeContent: function (data, callback) {
		    var params = {
		        TableName :_config.cognito.dynamodb.usersubscription,
		        Item:{
	        		"userid":data.userId,
			        "content_title": data.content_title,
			        "category": data.category,
			        "price": data.price,
		            "link": data.link,
		            "preview":data.preview,
		            "author": data.author
		            	
		        }
		    };
		    docClient.put(params, function(err, data) {
		    	
		        if (err) {
		        	callback.onFailure(err);
		            
		        } else {
		        	callback.onSuccess(data);
		            
		        }
		    });
		},
		listMySubscriptions: function(callback) {
			try{
				
				contentList = [];
				params = {
					TableName : _config.cognito.dynamodb.usersubscription,
					KeyConditionExpression: "#tag = :tagValue",
			        ExpressionAttributeNames:{
			            "#tag": "userid"
			        },
			        ExpressionAttributeValues: {
			            ":tagValue":_config.userId
			        }
				};
				
			    docClient.query(params, function(err, data) {
					
			        if (err) {
			            throw(err);
			        } else {
					    for(var k=0; k<data.Items.length; k++)
					    	contentList.push(data.Items[k]);
					    
					    callback.onSuccess(contentList);
			        }
			    });
				    
			}catch(e){
				alert(e);
				callback.onFailure(e);
			}
			
			    		

		},
		searchContentByTags: function(tags, callback) {
			
			var tagSet = tags.split(",");
			var content_title = {};
			var i;
			var found = 0;
			for(i=0; i<tagSet.length; i++){
				 params = {
					        TableName :  _config.cognito.dynamodb.tagTbl,
					        KeyConditionExpression: "#tag = :tagValue",
					        ExpressionAttributeNames:{
					            "#tag": "content_tag"
					        },
					        ExpressionAttributeValues: {
					            ":tagValue":tagSet[i].trim().toLowerCase()
					        }
					    };

					    docClient.query(params, function(err, data) {
							found++;
					        if (err) {
					            console.log(err);
					        } else {
							    for(var k=0; k<data.Items.length; k++)
								content_title[data.Items[k].content_title]={};
					            
								if(found == tagSet.length){
									found =  Object.keys(content_title).length;
									console.log("Total content_titles are ", found);
									console.log("content_title %o", content_title);
									Object.keys(content_title).forEach(function(key) {
					
										console.log("fetching record for " + key);
										params = {
											TableName : 'Content',
											KeyConditionExpression: "#tag = :tagValue",
											ExpressionAttributeNames:{
												"#tag": "content_title"
											},
											ExpressionAttributeValues: {
												":tagValue":key
											}
										};

										docClient.query(params, function(err, data) {
											found--;
											if (err) {
												console.log(err);
												callback.onFailure(err)
											} else {
												//for(var k=0; k<data.Items.length; k++)
												//content_title.push(data.Items[k].content_title);
												//console.log("data set %o", content_title);
												console.log("records =" + data);
												content_title[key]=data;
												
											}
											
											if(found <= 0){
												var recordItems = [];
												Object.keys(content_title).forEach(function(key) {
													recordItems.push(content_title[key].Items[0]);
												    
												});
												callback.onSuccess(recordItems);
												console.log("r %o", recordItems);	
											}
										});
									});
								
															
								}

					        }
					    });
			    		
				
			}
			
		    
			 
		    		

		}


}
							
							

						