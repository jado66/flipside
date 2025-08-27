import { redirect } from "next/navigation"

export default function SignupPage() {
  // Redirect to login page since we handle both login and signup in one form
  redirect("/login")
}
