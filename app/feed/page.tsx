import { redirect } from "next/navigation";

export default function FeedRedirectPage() {
  redirect("/hub#latest-posts");
}
