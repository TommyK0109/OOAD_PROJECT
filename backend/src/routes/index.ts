import { Router } from 'express';
import authRoutes from './auth.routes';
import movieRoutes from './movie.routes';
import watchPartyRoutes from './watchParty.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/parties', watchPartyRoutes);

export default router;