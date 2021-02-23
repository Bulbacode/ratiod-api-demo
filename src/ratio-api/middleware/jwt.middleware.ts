import * as admin from 'firebase-admin';
import * as functions from "firebase-functions";

export function verifyJWT(req: any, res: any, next: any): any {
  
  functions.logger.log(`Verifying JWT for new request`);

    if (!req.headers.authorization) {
      functions.logger.log(`Error verifying new request, no auth header`);

      return res.status(403).send({message: 'Missing authorization header'})
    }
  
    let jwt = req.headers.authorization.trim()

    return admin.auth().verifyIdToken(jwt).then((claims) => {

      functions.logger.log(`Successfully verified this request JWT`);

       req.user = claims
       next()
    }).catch((err) => {
      return res.status(400).send({
        message: 'Not Signed In'
      })
    })
}