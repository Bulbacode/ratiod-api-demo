import * as admin from 'firebase-admin';

const db = admin.firestore()

import * as functions from "firebase-functions";

const minimumUserNameLength: number = 4;

export function enforceUniqueUsername(req: any, res: any, next: any): any {

  const userData: any = req.body.user;
  functions.logger.log(`Verifying username for -- ${JSON.stringify(userData.username)}`);

  db.collection('usernames').doc(userData.username).get()
    .then((snapshot) => {
      
      console.log(`Document Exists ${snapshot.exists}`);

      if(snapshot.exists) {

        res.status(500).send({
          message: 'Error, username already in use',
        });
      } else if(userData.username.length < minimumUserNameLength) {

        res.status(300).send({
          message: `Error, username must be at least ${minimumUserNameLength}`
        });
      } else {

        next();
      }
    })
    .catch((error) => {

      res.status(500).send({
        message: 'Error getting username reference',
        error: error
      });
    });
}