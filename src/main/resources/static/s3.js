var S3 = S3 || {};

S3 = {

	init : function() {
		COGNITO.accessIdentityToken();
		// Create a service client with the provider

	},
	uploadFile : function(file, fileNameWithoutExtension, bucketName, callback) {

		var s3Admin = new AWS.S3({
			apiVersion : _config.cognito.s3.apiVersion,
			params : {
				Bucket : bucketName
			}
		});

		if (file) {

			var fileName = fileNameWithoutExtension;
			if (file.name.match(_config.videoExtRegExPattern)) {
				fileName = fileName
						+ file.name.substring(file.name.lastIndexOf("."));
			}

			//var albumPhotosKey = encodeURIComponent(albumName) + '//';

			//var photoKey =  fileName;
			s3Admin.upload({
				Key : fileName,
				Body : file,
				ACL : 'public-read'
			}, function(err, data) {
				if (err) {
					callback.onFailure(err);

				} else {
					callback.onSuccess(data);
				}

			});

		} else {
			alert('Please choose a file to upload first.');
			callback.onFailure(err);
		}

	},
	createFolder : function(callback) {

		var s3 = new AWS.S3({
			apiVersion : '2006-03-01',
			params : {
				Bucket : _config.cognito.s3.bucket_user_folder
			}
		});
		
		var folderName = _config.userId;
		var folderKey = encodeURIComponent(folderName) + '/';
		
		s3.headObject({
			Key : folderKey
		}, function(err, data) {
			if (!err) {
				alert('FolderKey already exists.');
				callback.onSuccess(data);
			}
			if (err.code !== 'NotFound') {
				alert('There was an error creating your folder: '
						+ err.message);
				callback.onFailure(err);
			}
			s3.putObject({
				Key : folderKey
			}, function(err, data) {
				if (err) {
					alert('There was an error creating your folder: '
							+ err.message);
					callback.onFailure(err);
				}
				console.log('Successfully created folder %o', data);
				callback.onSuccess(data);

			});
		});
	},
	listBucketItems : function(bucketName, callback) {

		var s3 = new AWS.S3({
			apiVersion : _config.cognito.s3.apiVersion,
			params : {
				Bucket : bucketName
						|| _config.cognito.s3.bucket_courseArtifacts
			}
		});

		s3.listObjects({
			Delimiter : '/'
		},
				function(err, data) {
					if (err) {
						alert('There was an error listing your albums: '
								+ err.message);
						callback.onFailure(err);

					} else {
						var albums = data.CommonPrefixes.map(function(
								commonPrefix) {
							var prefix = commonPrefix.Prefix;
							var albumName = decodeURIComponent(prefix.replace(
									'/', ''));
							return albumName;
						});
						console.log("List of albums: \o" + albums);
						callback.onSuccess(albums);

					}
				});
	},
	getFolderItems : function(folderName, bucketName, callback) {
		var s3 = new AWS.S3({
			apiVersion : _config.cognito.s3.apiVersion,
			params : {
				Bucket :bucketName,
			}
		});
		
		if (folderName != null) {
			var folderKey = encodeURIComponent(folderName);
			s3.listObjects({
				Prefix : "/"
			}, function(err, data) {
				if (err) {
					alert('There was an error viewing your folder: '
							+ err.message);
					callback.onFailure(err);
				}
				// 'this' references the AWS.Response instance that represents the response
				var href = this.request.httpRequest.endpoint.href;
				var bucketUrl = href
						+ bucketName + '/';

				var files = data.Contents.map(function(file) {
					var fileKey = file.Key;
					var fileUrl = bucketUrl + encodeURIComponent(fileKey);

					return fileUrl;
				});
				console.log("Photho URL : " + files)
				callback.onSuccess(files);
				/*$.ajax({
					url : photos,
					type : 'get',

					success : function(data) {
						console.log("Photo data success %o", data);
					},
					error : function() {
						console.log("failed to fetch photo data");
					}
				});*/

			});

		}
	}

}