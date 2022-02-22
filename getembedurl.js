const AWS = require('aws-sdk');

let awsCredentials = {
    region: "ap-southeast-2",
    accessKeyId: "",
    secretAccessKey: ""
};

AWS.config.update(awsCredentials);

module.exports = {
    getQuickSightUrl: function (idToken, username, callback) {
        // console.log('Token ' + idToken);
        console.log('called');
        AWS.config.region = 'ap-southeast-2';
        AWS.comfig.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: "",
            Logins: {
                '': idToken
            }
        });
        // console.log(AWS.config.credentials);
        var params = {
            //DurationSeconds: 3600,
            //ExternalId: "",
            RoleArn: "",
            RoleSessionName: username
        };
        var sts = new AWS.STS({
            apiVersion: ''
        });
        sts.assumeRole(params, function (err, data) {
            if (err) console.log("Assume erri :::::::::::::::::: ", err, err.stack); // an error occured
            else {
                // console.log("data: "+data);
                var paramas = {
                    AwsAccountId: '',
                    Email: '', // used in creating user pool
                    IdentityType: 'IAM', //| QUICKSIGHT, /* required */
                    Namespace: 'default',
                    UserRole: 'READER', //ADMIN | AUTHOR | READER | RESTRICTED_AUTHOR | RESTRICTED READER, /* required */
                    IamArn: '',
                    SessionName: username,
                };
                AWS.config.update({
                    access.KeyId: data.Credentials.AccessKeyId,
                    secretAccessKey: data.Credentials.SecretAccessKey,
                    sessionToken: data.Credentials.SessionToken,
                    "region": "ap-southeast-2"
                });
                var quicksight = new AWS.Service({
                    apiConfig: require("../quicksightconfig.json"),
                    region: "ap-southeast-2"
                });
                quicksight.registerUser(params, function (err, data1) {
                    if (err) {
                        console.log("::::::::::::::::::");
                        console.log(JSON.stringify(err));
                        if (err.statusCode == 409) {
                            //console.log("Register User :::::::::::::::::: ", data1);
                            quicksight.getDashboardEmbedUrl ({
                                AwsAccountId: "",
                                DashboardId: "",
                                IdentityType: "IAM",
                                ResetDisabled: true,
                                SessionLifetimeInMinutes: 400, 
                                UndoRedoDisabled: false
                            },
                            function (err, data) {
                                if (!err) {
                                    console.log(Date());
                                    callback(data);
                                } else {
                                    console.log(err);
                                    callback();
                                }
                            })
                        }
                    }
                })
            })
        })
    } 
}