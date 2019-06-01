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
			
			try{
				var params ; 
				var i;
				var isError = false;
				for(i=0; i<searchtags.length && !isError; i++){
					var tag = searchtags[i].trim().replace(_config.lineFeedPatternAroundString,'').toLowerCase();
					if(!tag) continue;
					
					params = {
					        TableName :_config.cognito.dynamodb.tagTbl,
					        Item:{
					            "content_tag": tag,
					            "content_title": contenttitle
					        }
					    };
					    docClient.put(params, function(err, data) {
					    	
					        if (err) {
					        	isError = true;
					        } 
					    });
				}				
				
				if(isError){
					callback.onFailure("failed to update tags");
				}else{
					callback.onSuccess();
				}
				
				
				
			}catch(err){console.log(err); callback.onFailure(err);}

			
			 
		},
		subscribeToContent: function (data, subscriptionmodel, callback) {
			
			DYNAMODB.queryTable("userid", _config.userId,
					"content_title", data.content_title.trim(), _config.cognito.dynamodb.usersubscription, {
				
				onSuccess:function(items){
					if(items.Items && items.Items.length>0){
						alert("Already subscribed");	
					}else{
						
						DYNAMODB.billAndSubscribe(data, subscriptionmodel, callback);
					}
	
				},
				onFailure:function(err){
					DYNAMODB.billAndSubscribe(data, subscriptionmodel, callback);
				}
			});
		},
		
		billAndSubscribe: function (data, subscriptionmodel, callback){
			data.price = data.price.trim();
			data.content_title = data.content_title.trim();
		    var params = {
		        TableName :_config.cognito.dynamodb.usersubscription,
		        Item:{
	        		"userid":data.userId.trim(),
			        "content_title": data.content_title.trim(),
			        "category": data.category.trim(),
			        "price": data.price.trim(),
		            "link": data.link.trim(),
		            "preview":data.preview.trim(),
		            "author": data.author.trim(),
		            "subscriptionmodel": subscriptionmodel
		            	
		        }
		    };
		    
		    if(subscriptionmodel == "onetimeprice"){
		    	
		    	DYNAMODB.updateBillingAndRevenueOnContentSharing(data.price, data.content_title, false,{
					onSuccess:function(){
						
						docClient.put(params, function(err, data) {
					    	
					        if (err) {
					        	callback.onFailure(err);
					            
					        } else {
					        	
					        	callback.onSuccess(data);
					            
					        }
					    });
						
						
					},
					onFailure:function(err){
						alert("Failed to debit your account. Subcription cancelled. Please try later.");
						callback.onFailure(err);
					}
				});
				

				
			}else if(subscriptionmodel == "priceperminute"){
				 docClient.put(params, function(err, data) {
				    	
				        if (err) {
				        	callback.onFailure(err);
				            
				        } else {
				        	callback.onSuccess(data);
				            
				        }
				    });
				
			}
		    
		   
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
			            throw err;
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
				var tag = tagSet[i].trim().toLowerCase();
				if(!tag) continue;
				
				
				params = {
			        TableName :  _config.cognito.dynamodb.tagTbl,
			        KeyConditionExpression: "#tag = :tagValue",
			        ExpressionAttributeNames:{
			            "#tag": "content_tag"
			        },
			        ExpressionAttributeValues: {
			            ":tagValue":tag
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
									TableName : _config.cognito.dynamodb.contentTbl,
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
							//no recors found
							callback.onSuccess([]);
													
						}

			        }
			    });
			    		
				
			}
			
		    
			 
		    		

		},
		updateContentReview: function(comment, rating, content_title, callback) {
			
			try{
				
				DYNAMODB.queryTable("userid", _config.userId,
						"content_title", content_title, _config.cognito.dynamodb.usersubscription, {
					
					onSuccess:function(items){
						var item = items.Items[0];
						
						item.comments = comment;
						var oldRating = 0;
						if(item.rating){
							oldRating = rating;
						}
						item.rating = rating;
						
						
						DYNAMODB.updateTable(item,  _config.cognito.dynamodb.usersubscription, {
							
							onSuccess:function(data){},
							onFialure:function(err){
								alert(err);
								//callback.onFailure(err);
							}

						});
						
						DYNAMODB.queryTable("content_title", content_title, null, null, _config.cognito.dynamodb.contentTbl, {
							
							onSuccess:function(items){
								var item = items.Items[0];
								
								item.comments = item.comments + "-" + comment;
								if(oldRating>0){
									var newRatingCount = parseInt(item.rating[oldRating+"star"])-1;
									if(newRatingCount<0){
										newRatingCount = 0;
									}
									item.rating[oldRating+"star"] = newRatingCount;
								}
								item.rating[rating+"star"] = parseInt(item.rating[rating+"star"])+1;
								
								DYNAMODB.updateTable(item,  _config.cognito.dynamodb.contentTbl, {
									
									onSuccess:function(data){callback.onSuccess(data);},
									onFialure:function(err){
										alert(err);
										callback.onFailure(err);
									}

								});
							},
							onFialure:function(err){
								alert(err);
								callback.onFailure(err);
							}
							
							
							
						});					
						
						
							
					},
					onFialure:function(err){
						alert(err);
						//callback.onFailure(err);
					}
					
					
					
				});

				
				
				
				
			}catch(e){
				alert(e); 
				callback.onFailure(e);
			}
			
	    		

		},
		addRevenueForContent:function(contentId, amount){
			
			
			DYNAMODB.queryTable("content_title", contentId,
					null, null, _config.cognito.dynamodb.contentTbl, {
				
				onSuccess:function(contentdata){
					
					var contentItem = contentdata.Items[0];
					if(contentItem.ownedByWorkspaceUserId){
						
						DYNAMODB.addToWallet(contentItem.ownedByWorkspaceUserId, amount, "revenueEarned From " + contentId, {
							onSuccess:function(data){console.log("revenue added to owner's account")},
							onFailure:function(err){console.log("failed to add revenue to owner's account")}
						});
					}
					
					
				},
				onFailure:function(err){}
			});
			
			
		},
		addToWallet: function(userId, amount, note, callback){
			

			try{
				var lastUpdated = +new Date;
				lastUpdated = lastUpdated + "";
				
				DYNAMODB.queryTable("userid", userId,
						null, null, _config.cognito.dynamodb.userwallet, {
					
					onSuccess:function(walletItems){
						
						var walletItem = walletItems.Items[0];
						
						
						if(!walletItem){
							walletItem = {
									userid: userId
							}
						}
						
						var lastCumulativeCredit = 0;
						if(walletItem.cumulativeCredit){
							lastCumulativeCredit = parseFloat(walletItem.cumulativeCredit);
						}
						walletItem.cumulativeCredit = parseFloat(lastCumulativeCredit) + parseFloat(amount);
						
						if(!walletItem.cumulativeDebit){
							walletItem.cumulativeDebit = "0";
						}
						
						
						walletItem.lastUpdated = lastUpdated+"";
						
						var newbalance = ( parseFloat(walletItem.cumulativeCredit) - parseFloat(walletItem.cumulativeDebit));
						DYNAMODB.updateTable(walletItem,  _config.cognito.dynamodb.userwallet, {
							
							onSuccess:function(data){
								var creditItem={
						        		"userid":userId,
						        		"timestamp": lastUpdated,
								        "creditamount": amount+"",
								        "note": note
							            	
							        };
									
									DYNAMODB.updateTable(creditItem,  _config.cognito.dynamodb.usercredit,{
										onSuccess:function(data){ callback.onSuccess({newBalance:newbalance}); },
										onFailure:function(err){ throw err;}
									});		
								
							},	
							onFialure:function(err){throw err; }

						});					
										
					},onFailure:function(err){ throw err;}
	
				});
				
			}catch(e){ 
				alert(e);  
				callback.onFailure(e);  
			}
		
    		
		},
		updateBillingAndRevenueOnContentSharing:function(contentPrice,contentid, negativeAllowed, callback){
			DYNAMODB.updateBilling(contentPrice,contentid, "Billed for Subscription", negativeAllowed, {
				
				onSuccess: function(data){
					DYNAMODB.addRevenueForContent(contentid.trim(), contentPrice, {
						onSuccess:function(){},
						onFailure:function(){}
					});
					
					callback.onSuccess(data);
				},
				
				onFailure:function(err){
					callback.onFailure(err);
				}
			})
		},
		updateBilling: function(contentPrice,contentid, note, negativeAllowed, callback){
			if(parseFloat(contentPrice) <= 0){
				callback.onSuccess();
				return;
			}

			try{
				var lastUpdated = +new Date;
				lastUpdated = lastUpdated + "";
				DYNAMODB.queryTable("userid", _config.userId,
						null, null, _config.cognito.dynamodb.userwallet, {
					
					onSuccess:function(walletItems){
						
						var walletItem = walletItems.Items[0];
						if(!walletItem && negativeAllowed){
							walletItem.userid = _config.userId;
							walletItem.cumulativeCredit = 0;
							walletItem.cumulativeDebit = 0;
						}
						
						
						if(walletItem){
							
							//checkalance
							 
							
							if(!walletItem.cumulativeCredit){
								walletItem.cumulativeCredit = 0;
							}
							if(!walletItem.cumulativeDebit){
								walletItem.cumulativeDebit = 0;
							}
							
							var balance = parseFloat(walletItem.cumulativeCredit) - parseFloat(walletItem.cumulativeDebit);
							
							if(balance <= 0 && !negativeAllowed){
								var err = {reason:1000};
								callback.onFailure(err);
								return;
							}
							
							
							
							walletItem.cumulativeDebit = parseFloat(walletItem.cumulativeDebit) + parseFloat(contentPrice);
							walletItem.lastUpdated = lastUpdated+"";
							
							var billingItem={
				        		"userid":_config.userId,
				        		"timestamp": lastUpdated,
						        "content_title": contentid.trim(),
						        "debitamount": contentPrice,
						        "note":note
					            	
					        };
							
							DYNAMODB.updateTable(billingItem,  _config.cognito.dynamodb.userbilling,{
								onSuccess:function(data){

									DYNAMODB.updateTable(walletItem,  _config.cognito.dynamodb.userwallet, {
										
										onSuccess:function(data){ 
											
											var balance = ( parseFloat(walletItem.cumulativeCredit) - parseFloat(walletItem.cumulativeDebit));
											if( balance <= 0 ){
												var err = {reason:1000}
												callback.onFailure(err); 
									
											}else{
												var data = {balance: balance};
												callback.onSuccess(data); 
											}
											
										},
										onFialure:function(err){callback.onFailure(err); }
		
									});
								},
								onFailure:function(err){ callback.onFailure(err);}
							});						
						}else{
							console.log("Failed to retrieve wallet item or no record exists. Cannot continue! Please fill your wallet first, if not done so.");
							var err = {reason:1000};
							callback.onFailure(err);
						}
						
						
		
					},onFailure:function(err){ throw err;}
	
				});
				
			}catch(e){
				alert(e); 
				callback.onFailure(e); 
			}
		
    		
		},
		queryTable: function(queryKey, queryValue, sortKey, sortValue, tableName, callback) {
			try{
				
				contentList = [];
				var params;
				if(sortKey){
					params = {
							TableName : tableName,
							KeyConditionExpression: "#tag = :tagValue and #sortkey = :sortValue",
					        ExpressionAttributeNames:{
					            "#tag": queryKey,
					            "#sortkey": sortKey
					        },
					        ExpressionAttributeValues: {
					            ":tagValue":queryValue,
					            ":sortValue":sortValue
					        }
						};
				}else{
					params = {
							TableName : tableName,
							KeyConditionExpression: "#tag = :tagValue",
					        ExpressionAttributeNames:{
					            "#tag": queryKey
					        },
					        ExpressionAttributeValues: {
					            ":tagValue":queryValue
					        }
						};
				}
				
						
				
			    docClient.query(params, function(err, data) {	
			        if (err) {  throw err;  } 
			        else {  
			        	callback.onSuccess(data);
			        	
			        }
			    });
			    
			    
				    
			}catch(e){ alert(e); callback.onFailure(e); }
			
			    		

		},
		updateTable: function(item, tableName, callback) {
			try{
				
				 var params = {
		        TableName :tableName,
			        Item:item
			    };
			    docClient.put(params, function(err, data) {
			    	
			        if (err) {throw err;} else {callback.onSuccess(data); }
		    });
				    
			}catch(e){
				alert(e);
				callback.onFailure(e);
			}
			
			    		

		}
		
		
		
		
		
		


}
							
							

						