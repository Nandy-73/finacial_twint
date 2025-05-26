
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export type AuthState = {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  error: Error | null;
};

export async function signUp({ email, password, firstName, lastName }: { 
  email: string; 
  password: string;
  firstName: string;
  lastName: string;
}) {
  console.log("Signing up user with email:", email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });
  
  console.log("Sign up response:", data?.user?.id ? "User created" : "No user created", "Error:", error);
  return { data, error };
}

export async function signIn({ email, password }: { email: string; password: string }) {
  console.log("Attempting sign in for:", email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  console.log("Sign in response:", data?.session ? "Session created" : "No session created", "Error:", error);
  return { data, error };
}

export async function signOut() {
  console.log("Signing out user");
  const { error } = await supabase.auth.signOut();
  console.log("Sign out complete, error:", error);
  return { error };
}

export async function resetPassword(email: string) {
  console.log("Requesting password reset for:", email);
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  console.log("Password reset response:", data ? "Email sent" : "No email sent", "Error:", error);
  return { data, error };
}

export async function updatePassword(password: string) {
  console.log("Updating user password");
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  
  console.log("Password update response:", data?.user ? "User updated" : "No user updated", "Error:", error);
  return { data, error };
}
