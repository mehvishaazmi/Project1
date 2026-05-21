export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const demoUser = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@travelbuddy.local",
  initials: "DU",
};

export const demoAdminUser = {
  id: "demo-admin",
  name: "Dev Admin",
  email: "admin@gmail.com",
  initials: "AD",
};

export const adminEmail = "admin@gmail.com";
