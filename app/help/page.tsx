import { permanentRedirect } from "next/navigation";

export default function HelpPageRedirect() {
  permanentRedirect("/support");
}
