    
window._config = {
	videoStreamingRegExPattern:/\.m3u8/g,	
	videoExtRegExPattern:/\.mp4|\.mov|\.m3u8/g,
    cognito: {
    	region: 'us-east-1', // e.g. us-east-2
    	
        userPool:{
        	userPoolId: 'us-east-1_hCrbn9IWs', // e.g. us-east-2_uXboG5pAb
            
    		clientId: '4sqfnv9fs4l3k02gnk81n1kbi2', //is this used anywhere?
        },
		identityPool: {
			identityPoolId: 'us-east-1:4adcf012-d73f-4c77-823f-b22913a4661d'
		},
		s3:{
			apiVersion:'2006-03-01',
			bucket_course_destination:'classifiedcourses',
			bucket_course_hls_source_origin: 'mmlvideostreamingsolution-source-n6swh5wfqrxg',
			bucket_course_hls_destination_origin: 'https://s3.amazonaws.com/mmlvideostreamingsolution-destination-r4v2gcf173up'
				
		},
		dynamodb:{
			contentTbl:'Content',
			tagTbl:'ContentByTag',
			mmlworkspace:'mmlworkspace',
			orgaccounts:'org_accounts',
			useraccounts:'user_accounts',
			usersubscription:'usersubscription'
		}
    },
};