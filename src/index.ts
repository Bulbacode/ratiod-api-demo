import * as admin from 'firebase-admin';
admin.initializeApp();

import * as functions from "firebase-functions";
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from "body-parser";
import * as helmet from "helmet";

import { enforceUniqueUsername } from './ratio-api/middleware/uniqueUsername.middleware';
import { createUser, deleteUser, getUser, updateUser } from './ratio-api/services/user/user.service';
import { verifyJWT } from './ratio-api/middleware/jwt.middleware';

const webApi = express();
webApi.use(helmet());
webApi.use(cors({ origin: true }));
webApi.use(bodyParser.json());
webApi.use(bodyParser.urlencoded({ extended: false }));

// User Service Endpoints
webApi.post('/create/:username', enforceUniqueUsername, createUser);
webApi.put('/:username', verifyJWT, enforceUniqueUsername, updateUser);
webApi.delete('/:username', verifyJWT, deleteUser);
webApi.get('/:uid', verifyJWT, getUser);

export const api = functions.https.onRequest(webApi);
