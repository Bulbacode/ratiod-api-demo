import * as admin from 'firebase-admin';

const db = admin.firestore()
const usernames = db.collection('usernames')
const users = db.collection('users')

import * as functions from "firebase-functions";

export function createUser(req: any, res: any): any {

    let userData: any = req.body.user;
    userData.username = userData.username.toLowerCase();

    functions.logger.log(`New User Data Object -- ${userData}`);

    // Attempt to create the user account
    admin.auth().createUser({
        email: userData.email,
        emailVerified: false,
        password: userData.password, // TODO : Hide PW behind SHA256 from client to server
        displayName: userData.username,
        photoURL: userData.photoURL,
        disabled: false
    })
    .then((userRecord) => {
        
        // Attempt to set the user data document
        users.doc(userRecord.uid).set({
            email: userData.email,
            emailVerified: false,
            username: userData.username,
            photoURL: userData.photoURL
        }, {
            merge: true
          }).then(() => {
      
              functions.logger.log(`Successfully created user data for new user ${userRecord.uid}`);
              
              // Attempt to set the username document based on the selected name
              usernames.doc(userData.username).set({uid: userRecord.uid})
                  .then(() => {
      
                      res.status(200).send({
                          message: 'Successfully created user data',
                          uid: userRecord.uid
                      });
                  })
                  .catch((error) => {
      
                      res.status(500).send({
                          message: 'Error creating username record for user',
                          error: error
                      });
                  });
          })
          .catch(async (err) => {
      
              functions.logger.log(`Error creating DB Records -- ${err.message}`);
      
              await admin.auth().deleteUser(userRecord.uid);
      
              functions.logger.log(`Deleted User ${userRecord.uid} Due to error creating DB Records`);
      
              res.status(500).send({
                  message: 'Error creating new user data',
                  error: err
              });
          });
    })
    .catch((error) => {
        res.status(300).send({
            message: 'Error creating user account',
            error: error
        });
    });

    
}

export function updateUser(req: any, res: any): any {
    let userData = req.body.user;

    return users.doc(req.user.uid).set(userData, {
        merge: true
    }).then(() => {
        res.status(200).send({
            message: 'Successfully updated user data.'
        });
    }).catch((err) => {
        res.status(500).send({
            message: 'Error updating user data',
            error: err
        });
    });
}

export function getUser(req: any, res: any): any {
    
    return users.doc(req.params.uid)
        .get()
        .then((userData) => { 
            functions.logger.log(userData);
            res.status(200).send(userData);
        })
        .catch((error) => { 
            functions.logger.log('There was an error');
            functions.logger.log(error);
            res.status(500).send(error);
        });
}

export function deleteUser(req: any, res: any) {
    
    return users.doc(req.user.uid)
        .delete().then(() => {
            usernames.doc(req.params.username)
                .delete().then(() => {
                    res.status(200).send({message: 'Successfully deleted user'});
                }).catch((err) => {
                    res.status(500).send({
                        message: 'Error deleting username reference.',
                        error: err
                    });
                });
        }).catch((err) => {
            res.status(500).send({
                message: 'Error deleting user reference.',
                error: err
            });
        });
}