import express from 'express';
import { 
  getAllUsers, 
  toggleAdminStatus, 
  deleteUser, 
  getAllReviews, 
  updateReviewStatus, 
  deleteReview,
  getDashboardStats
} from '../controllers/adminController.js';
import {
  getPasswordPolicy,
  updatePasswordPolicy
} from '../controllers/passwordPolicyController.js';
import { authenticate, adminAuth } from '../middleware/auth/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Get a list of all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/users', authenticate, adminAuth, getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/toggle-admin:
 *   patch:
 *     summary: Toggle admin status
 *     description: Toggle admin status for a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Admin status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     isAdmin:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/users/:userId/toggle-admin', authenticate, adminAuth, toggleAdminStatus);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:userId', authenticate, adminAuth, deleteUser);

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: Get all reviews
 *     description: Get a list of all reviews with product information (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       productId:
 *                         type: integer
 *                       productName:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       comment:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, approved, rejected]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/reviews', authenticate, adminAuth, getAllReviews);

/**
 * @swagger
 * /api/admin/reviews/{reviewId}/status:
 *   patch:
 *     summary: Update review status
 *     description: Update a review's status (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Review status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
// Support both PATCH and POST for wider compatibility
router.patch('/reviews/:reviewId/status', authenticate, adminAuth, updateReviewStatus);
router.post('/reviews/:reviewId/status', authenticate, adminAuth, updateReviewStatus);

/**
 * @swagger
 * /api/admin/reviews/{reviewId}:
 *   delete:
 *     summary: Delete review
 *     description: Delete a review (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the review
 *     responses:
 *       200:
 *         description: Review deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete('/reviews/:reviewId', authenticate, adminAuth, deleteReview);

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Get statistics for admin dashboard (counts of products, users, and pending reviews)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     productCount:
 *                       type: integer
 *                     userCount:
 *                       type: integer
 *                     pendingReviewCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/dashboard/stats', authenticate, adminAuth, getDashboardStats);

/**
 * @swagger
 * /api/admin/password-policy:
 *   get:
 *     summary: Get password policy
 *     description: Get the current password policy settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password policy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     minimumPasswordLength:
 *                       type: integer
 *                     requireUppercase:
 *                       type: boolean
 *                     requireLowercase:
 *                       type: boolean
 *                     requireNumbers:
 *                       type: boolean
 *                     requireSpecialChars:
 *                       type: boolean
 *                     passwordExpiryDays:
 *                       type: integer
 *                     preventPasswordReuse:
 *                       type: boolean
 *                     passwordHistoryCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/password-policy', authenticate, adminAuth, getPasswordPolicy);

/**
 * @swagger
 * /api/admin/password-policy:
 *   put:
 *     summary: Update password policy
 *     description: Update the password policy settings (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minimumPasswordLength:
 *                 type: integer
 *                 minimum: 6
 *                 maximum: 32
 *               requireUppercase:
 *                 type: boolean
 *               requireLowercase:
 *                 type: boolean
 *               requireNumbers:
 *                 type: boolean
 *               requireSpecialChars:
 *                 type: boolean
 *               passwordExpiryDays:
 *                 type: integer
 *                 minimum: 0
 *               preventPasswordReuse:
 *                 type: boolean
 *               passwordHistoryCount:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 24
 *     responses:
 *       200:
 *         description: Password policy updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     minimumPasswordLength:
 *                       type: integer
 *                     requireUppercase:
 *                       type: boolean
 *                     requireLowercase:
 *                       type: boolean
 *                     requireNumbers:
 *                       type: boolean
 *                     requireSpecialChars:
 *                       type: boolean
 *                     passwordExpiryDays:
 *                       type: integer
 *                     preventPasswordReuse:
 *                       type: boolean
 *                     passwordHistoryCount:
 *                       type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.put('/password-policy', authenticate, adminAuth, updatePasswordPolicy);

export default router;