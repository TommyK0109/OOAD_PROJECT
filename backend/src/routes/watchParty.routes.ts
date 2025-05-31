import { Router } from 'express';
import { watchPartyController } from '../controllers/watchParty.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no auth required)
router.get('/validate/:inviteCode', watchPartyController.validateInviteCode);
router.get('/active', watchPartyController.getActiveParties);

// All other routes require authentication
router.use(authMiddleware);

// Party management
router.post('/', watchPartyController.createParty);
router.get('/', watchPartyController.getUserParties);
router.get('/:partyId', watchPartyController.getPartyDetails);
router.get('/join/:inviteCode', watchPartyController.joinByInviteCode);
router.post('/:partyId/leave', watchPartyController.leaveParty);
router.delete('/:partyId', watchPartyController.deleteParty);

// Invitations
router.post('/:partyId/invite', watchPartyController.sendInvitation);
router.get('/invitations/received', watchPartyController.getReceivedInvitations);
router.patch('/invitations/:invitationId', watchPartyController.respondToInvitation);

export default router;