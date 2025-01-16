import { UserStore } from "@/stores/user";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = UserStore();
  console.log('aaaa', user.canViewDashboard)
  if (!user.isLoggedIn) {
    return navigateTo('/login', { replace: true });
  }

  if (!user.canViewDashboard) {
    return navigateTo('/reader', { replace: true });
  }
});
