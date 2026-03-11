/**
 * User model: Admin, Member, Non-member
 *
 * ADMIN: 1 person who manages the app (role === ROLE_ADMIN in Firestore)
 * MEMBER: Signed-in users (has auth.currentUser)
 * NON_MEMBER: Visitors who haven't signed in (no auth)
 * USERS: Everyone on the site (Members + Non-members)
 */

export const ROLE_ADMIN = 'admin';
export const ROLE_USER = 'user';

/** Default role for new signed-in users (Members) */
export const DEFAULT_MEMBER_ROLE = ROLE_USER;
