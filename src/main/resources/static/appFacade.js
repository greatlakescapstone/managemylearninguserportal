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
									onSuccess:function(data){ callback.onSuccess(); },
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
										onSuccess:function(data){ callback.onSuccess(data);},
										
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
		postContent: function(category, author, title, preview, price, tags, files){
			
			var content_title = author+"_"+title;
			var fileNameWithoutExtension = content_title
			
			var file = files[0];
			S3.uploadFile(file, fileNameWithoutExtension, _config.cognito.s3.bucket_course_destination, {
				
				onSuccess: function(data){
					
					var itemDetails = {
					        "content_title": content_title,
					        "price":price,
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
					        "comments":"-"
					}
					
					DYNAMODB.createContent(itemDetails, 
							{
								onSuccess(data){
								console.log("PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2));
								},onFailure(err){
									console.log("Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2));
								}
					});
					
					
					var searchTags = [category, author, title].concat(tags.split(","));
					
					DYNAMODB.registerContentWithSearchTags(searchTags, content_title,	
					{ 
						onSuccess(data){
							console.log("SearchTag succeeded: " + "\n" + JSON.stringify(data, undefined, 2));
						},onFailure(err){
							console.log("Unable to add searchTag: " + "\n" + JSON.stringify(err, undefined, 2));
						}
					});
					
					
					if( file.name.match(_config.videoExtRegExPattern)){
						S3.uploadFile(file, fileNameWithoutExtension, _config.cognito.s3.bucket_course_hls_source_origin, {
							onSuccess:function(data){
								itemDetails.linkshls=_config.cognito.s3.bucket_course_hls_destination_origin + "/" + fileNameWithoutExtension + "/hls/" + fileNameWithoutExtension +".m3u8";
								DYNAMODB.createContent(itemDetails, 
										{
											onSuccess(data){
												console.log("Update data with video streaming link for  "+ fileNameWithoutExtension + "\n" + JSON.stringify(data, undefined, 2));
											},onFailure(err){
												console.log("Failed to update video streaming link for streaming link for  "+ fileNameWithoutExtension + "\n" + JSON.stringify(err, undefined, 2));
											}
								});
								
							},
							onFailure: function(err){
								alert("Video streaming conversion request upload failed for "+ fileNameWithoutExtension + "\n" + JSON.stringify(err, undefined, 2));
								
								
							}
						});
					}
					
					
					
					
						
					
					
					
					
					
					
				},
				onFailure: function(err){
					alert('There was an error uploading your file: ', err.message);
				}
			});

			

			
		}
		
}
