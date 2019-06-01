var AppController = AppController || {}	

AppController = {
		registerMMLWorkspaceForaUser: function(mmlWorkspaceData, callback){
			
			try{
				COGNITO.registerAccount(mmlWorkspaceData.userId, mmlWorkspaceData.password, 
						         mmlWorkspaceData.firstName + " " + mmlWorkspaceData.lastName, mmlWorkspaceData.email, {
					
					onSuccess:function(data){
						

						
						DYNAMODB.createMMLWorkspace(mmlWorkspaceData.userId, mmlWorkspaceData.workspaceName,
								mmlWorkspaceData.firstName + "_" + mmlWorkspaceData.lastName, 
								                mmlWorkspaceData.phoneNumber, mmlWorkspaceData.email, {
							
							onSuccess:function(data){
								
								mmlWorkspaceData.workspace = mmlWorkspaceData.userId + "-" + data.workspaceid;
								
								DYNAMODB.createUserAccount(mmlWorkspaceData, {
									onSuccess:function(data){ 
										alert("Congratulations!! User registeration is successful. Add more")
										callback.onSuccess(data); 
										
									},
									onFailure:function(err){ throw(err); }
								});
								
	
							},
							onFailure:function(err){ throw(err); }
							
							
						});
						
					},
					onFailure:function(err){ throw(err); }
					
					
				});
				
			}catch(err){
				alert(err);
				callback.onFailure(err);
			}

		},
		registerMMLWorksapceForOrganisation: function(mmlWorkspaceOrgData, callback){
			
			try{
				COGNITO.registerAccount(mmlWorkspaceOrgData.orgId, mmlWorkspaceOrgData.password, 
						                                    mmlWorkspaceOrgData.contactPersonFirstName+ " " + mmlWorkspaceOrgData.contactPersonLastName, mmlWorkspaceOrgData.email, {
					
					onSuccess:function(data){
						
							DYNAMODB.createOrgAccount(mmlWorkspaceOrgData,  {
								
								onSuccess:function(data){
									
									DYNAMODB.createMMLWorkspace(mmlWorkspaceOrgData.orgId, mmlWorkspaceOrgData.workspaceName,
											mmlWorkspaceOrgData.orgName, mmlWorkspaceOrgData.phoneNumber, mmlWorkspaceOrgData.email,{
										
										//success callback
										onSuccess:function(data){ 
											alert("Congratulations!! Organisation registeration is successful. Add more")

											callback.onSuccess(data);
										},
										
										onFailure:function(err){throw(err);	}
									});
									
								},
								onFailure:function(err){throw(err); }
							});
					},
					onFailure:function(err){throw(err); }
					
					
				});
				
			}catch(err){
				alert(err);
				callback.onFailure(err);
			}

		},
		//publishes existing user content to externals (the actual content is already uploaded)
		publishMyContent:function(contentId, callback){
			DYNAMODB.queryTable("content_title", contentId, null, null, _config.cognito.dynamodb.contentTbl, {
				
				onSuccess:function(items){
					var item = items.Items[0];
					
					if(item.restricted != "-"){
						var tags = item.tags;
						var authorFirstName = item.author.substring(0,item.author.indexOf(' '));
						var searchTags = [item.category, item.author, authorFirstName, item.title].concat(tags.split(","));
						
						DYNAMODB.registerContentWithSearchTags(searchTags, item.content_title,	
						{ 
							onSuccess(data){
								console.log("SearchTag succeeded: " + "\n" + JSON.stringify(data, undefined, 2));
								
								
								item.restricted="-";
								item.ownedByWorkspace=_config.user.workspace;
								item.ownedByWorkspaceUserId=_config.user.userId;
								DYNAMODB.updateTable(item,  _config.cognito.dynamodb.contentTbl, {
									
									onSuccess:function(data){
										alert("published successfully");
										callback.onSuccess(data);
										DYNAMODB.updateBilling(_config.publishingCost,item.content_title, "Billed for publishing", false,{
											onSuccess:function(){ },
											onFailure:function(err){ }
										});
										
									},
									onFialure:function(err){
										alert("failed to publish " + err);
										//callback.onFailure(err);
									}

								});
	
						        
							},onFailure(err){
								console.log("Unable to add searchTag: " + "\n" + JSON.stringify(err, undefined, 2));
							}
						});
					}

					
					
				},
				onFialure:function(err){
					alert(err);
					callback.onFailure(err);
				}
				
				
				
			});	
			
		},
		postContentForSelf: function(category, author, title, preview, priceperminute, onetimeprice, tags, files){
			
			var content_title = author+"_"+title;
			content_title = content_title.trim().replace(_config.lineFeedPattern,'');
			
			DYNAMODB.updateBilling(_config.selfUploadCost,content_title, "Billed for uploading", false,{
				onSuccess:function(){
					
					
					AppController.postContent(category, author, title, preview, priceperminute, onetimeprice, tags, files)
				},
				onFailure:function(err){
					alert("Subcription cancelled. Failed to debit your account. Maybe wallet balance is negative. Please check and retry.");
					callback.onFailure(err);
				}
			});
			
		},
		
		//upload and publishes new content
		postContent: function(category, author, title, preview, priceperminute, onetimeprice, tags, files){
			
			category = category.trim().replace(_config.lineFeedPatternAroundString,'');
			title = title.trim().replace(_config.lineFeedPatternAroundString,'');
			preview = preview.trim().replace(_config.lineFeedPatternAroundString,'');
			
			var content_title = author+"_"+title;
			content_title = content_title.trim().replace(_config.lineFeedPattern,'');
			
			
			
			var file = files[0];
			var customFileName = content_title
			
			var extIndex = file.type.indexOf("/");
			if(extIndex >= 0 && !file.type.substring(extIndex+1).match(_config.videoExtRegExTypePattern)){
				customFileName = customFileName + file.type.substring(extIndex+1);
			}
			

			S3.uploadFile(file, customFileName, _config.cognito.s3.bucket_course_destination, {
				
				onSuccess: function(data){
					
					data.Location = data.Location.replace(_config.cognito.s3.bucket_course_destination_domain,_config.cognito.cloudfront.classfieddomain);
					var itemDetails = {
					        "content_title": content_title,
					        "price":priceperminute,
					        "onetimeprice":onetimeprice,
				            "category": category,
				            "author": author,
				            "title": title,
				            "preview":preview,
				            "links":data.Location,
					        "rating":{
					        	"5star":0,
					        	"4star":0,
					        	"3star":0,
					        	"2star":0,
					        	"1star":0,
					        },
					        "comments":"-",
					        "tags":tags,
					        "restricted":_config.user.workspace,
					        "ownedByWorkspace":_config.user.workspace,
					        "ownedByWorkspaceUserId":_config.user.userId,
					        
					}
					
					DYNAMODB.createContent(itemDetails, 
							{
								onSuccess(data){
								console.log("PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2));
								},onFailure(err){
									console.log("Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2));
								}
					});
					
					var authorFirstName = author.substring(0,author.indexOf(' '));
					var searchTags = [_config.myWSContentTag];
					
					DYNAMODB.registerContentWithSearchTags(searchTags, content_title,	
					{ 
						onSuccess(data){
							console.log("SearchTag succeeded: " + "\n" + JSON.stringify(data, undefined, 2));
						},onFailure(err){
							console.log("Unable to add searchTag: " + "\n" + JSON.stringify(err, undefined, 2));
						}
					});
					
					
					if( file.name.match(_config.videoExtRegExPattern)){
						S3.uploadFile(file, customFileName, _config.cognito.s3.bucket_course_hls_source_origin, {
							onSuccess:function(data){
								itemDetails.linkshls="https://"+_config.cognito.cloudfront.hlsdomain + "/" + customFileName + "/hls/" + customFileName +".m3u8";
								DYNAMODB.createContent(itemDetails, 
										{
											onSuccess(data){
												alert("Successfully uploaded video content");
												console.log("Update data with video streaming link for  "+ customFileName + "\n" + JSON.stringify(data, undefined, 2));
											},onFailure(err){
												console.log("Failed to update video streaming link for streaming link for  "+ customFileName + "\n" + JSON.stringify(err, undefined, 2));
											}
								});
								
							},
							onFailure: function(err){
								alert("Video streaming conversion request upload failed for "+ customFileName + "\n" + JSON.stringify(err, undefined, 2));
								
								
							}
						});
					}else{
						alert("Successfully uploaded content");
					}
									
					
				},
				onFailure: function(err){
					alert('There was an error uploading your file: ', err.message);
				}
			});

			

			
		}
		
		
		
}
