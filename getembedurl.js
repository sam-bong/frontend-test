const AWS = require('aws-sdk');

let awsCredentials = {
    region: "ap-southeast-2",
    accessKeyId: "",
    secretAccessKey: ""
  };

AWS.config.update(awsCredentials);

module.exports = {
    getQuickSightUrl: function (idToken, username, callback) {
        //  console.log('Token '+ idToken);
        console.log('called');
        AWS.config.region = 'ap-southeast-2';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: "",
            Logins: {
                'cognito-idp.us-west-2.amazonaws.com/us-west-2_XXGXXXznX': idToken
            }
        });

        // console.log(AWS.config.credentials);
        var params = {
            //DurationSeconds: 3600,
            //ExternalId: "123ABC",
            RoleArn: "arn:aws:iam::XXXX5XXXXXX5:role/QuickSightIdentityPool",
            RoleSessionName: username
        };

        var sts = new AWS.STS({
            apiVersion: '2011-06-15'
        });

        sts.assumeRole(params, function (err, data) {
            if (err) console.log("Assumwe erri :::::::::::::::::: ", err, err.stack); // an error occurred
            else {
                // console.log("data: "+data);
                var params = {
                    AwsAccountId: 'XXXX5XXXXXX5',
                    Email: 'XXXXXXXXXX@XXXXX.XXX', //used in creating userpool
                    IdentityType: 'IAM', //| QUICKSIGHT, /* required */
                    Namespace: 'default',
                    UserRole: 'READER', //ADMIN | AUTHOR | READER | RESTRICTED_AUTHOR | RESTRICTED_READER, /* required */
                    IamArn: 'arn:aws:iam::XXXX5XXXXXX5:role/QuickSightIdentityPool',
                    SessionName: username,
                };

                AWS.config.update({
                    accessKeyId: data.Credentials.AccessKeyId,
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
                        console.log(":::::::::::::::::::::::");
                        console.log(JSON.stringify(err));
                        if (err.statusCode == 409) {
                            // console.log("Register User :::::::::::::::: ", data1);
                            quicksight.getDashboardEmbedUrl({
                                    AwsAccountId: "XXXX5XXXXXX5",
                                    DashboardId: "XXXXX2X9-XXXX-4XX5-XXXX-XXXXX3ba90a9",
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
                                }
                            );
                        }
                        console.log("err register user ::::::::::::::::::", err, err.stack);
                    } // an error occurred
                    else {
                        // console.log("Register User :::::::::::::::: ", data1);
                        quicksight.getDashboardEmbedUrl({
                                AwsAccountId: "XXXX5XXXXXX5",
                                DashboardId: "XXXXX2X9-XXXX-4XX5-XXXX-XXXXX3ba90a9",
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
                            }
                        );
                    }
                });
            }
        });
    }
}