export function extractGoogleProfile(profile: any) {
  return {
    googleId: profile.id,
    email: profile.emails?.[0]?.value || '',
    name: profile.displayName || 'Anonymous',
    avatar: profile.photos?.[0]?.value || '',
  };
}
