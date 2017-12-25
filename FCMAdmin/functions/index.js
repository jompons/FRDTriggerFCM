const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const payload = {
		notification: {
			title: 'New message arrived',
			body: 'come check it',
			badge: '1',
			icon: 'myicon',
			sound: 'default',
			color: '#rrggbb',
			click_action: 'OPEN_DETAIL_ACTIVITY'
		},
		data: {
			picture_url: 'http://opsbug.com/static/google-io.jpg'
		}
	};

exports.sendPushNotificationToken = functions.database.ref('/messages/{id}').onWrite(event => {
	
	return admin.database().ref('fcmToken').once('value').then(allToken => {

		const allTokenJson = allToken.val();
		if( allTokenJson ){
			const tokenKeys = Object.keys(allTokenJson);
			const tokens = tokenKeys.map(function(key) { return allTokenJson[key]; });

			console.log("tokenKeys: ", tokenKeys);
			return admin.messaging().sendToDevice(tokens, payload)
			.then(function(response) {
				
			 	console.log("Tokens: ", tokens);
				console.log("Successfully sent message: ", response);
				console.log(response.results[0].error);
			})
			.catch(function(error) {

				console.log("Tokens: ", tokens);
			    console.log("Error sending message: ", error);
			});
		};
	});
});

exports.sendPushNotificationTopic = functions.database.ref('/messages/{id}').onWrite(event => {
	
	payload.notification.body = event.data.val().message;
	console.log("Message: ", event.data.val().message);
	return admin.database().ref('fcmTopic').once('value').then(snapshot => {
		if( snapshot.val() ){

			const allTopic = snapshot.val();
			console.log("allTopic: ", allTopic);

			return admin.messaging().sendToTopic(allTopic.subscribe1, payload)
			.then(function(response) {
				
				console.log("Topic: ", allTopic.subscribe1);
				console.log("Successfully sent message: ", response);
				console.log(response.results[0].error);
			})
			.catch(function(error) {

				console.log("Topic: ", allTopic.subscribe1);
			    console.log("Error sending message: ", error);
			});
		};
	});
});

exports.sendPushNotificationAllTopic = functions.database.ref('/messages/{id}').onWrite(event => {
	
	payload.notification.body = event.data.val().message;
	console.log("Message: ", event.data.val().message);
	return admin.database().ref('fcmTopic').once('value').then(snapshot => {
		if( snapshot.val() ){

			const allTopic = snapshot.val();
			console.log("allTopic: ", allTopic);

			const topicKeys = Object.keys(allTopic);
			const topics = topicKeys.map(function(key) { return allTopic[key]; });

			var condition = "";
			for(var i=0;i<topics.length;i++){
				if( i != 0 )
					condition += " || ";
				condition += "'"+topics[i] + "' in topics"
			}

			return admin.messaging().sendToCondition(condition, payload)
			.then(function(response) {
				
				console.log("Condition: ", condition);
				console.log("Successfully sent message: ", response);
				console.log(response.results[0].error);
			})
			.catch(function(error) {

				console.log("Condition: ", condition);
			    console.log("Error sending message: ", error);
			});
		};
	});
});