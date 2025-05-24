import { Router } from 'express';
import { watchPartyController } from '../controllers/watchParty.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All watch party routes require authentication
router.use(authMiddleware);

// Party management
router.get('/', watchPartyController.getUserParties);
router.get('/active', watchPartyController.getActiveParties);
router.get('/:partyId', watchPartyController.getPartyDetails);
router.post('/invite/:inviteCode', watchPartyController.joinByInviteCode);

// Invitations
router.post('/:partyId/invite', watchPartyController.sendInvitation);
router.get('/invitations/received', watchPartyController.getReceivedInvitations);
router.patch('/invitations/:invitationId', watchPartyController.respondToInvitation);

export default router;