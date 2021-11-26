
import express from 'express';
import {getUserFromToken} from "./UserFunctions.js";
import Vote from "./models/Vote.js";
import Voter from "./models/Voter.js";
const router = express.Router();



export default router;