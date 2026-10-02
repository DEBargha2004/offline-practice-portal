import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa6";

interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isExternal?: boolean;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "GitHub",
    href: "https://github.com/DEBargha2004",
    icon: FaGithub,
    isExternal: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/debargha-saha-07b738192",
    icon: FaLinkedin,
    isExternal: true,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/debargha6203",
    icon: FaInstagram,
    isExternal: true,
  },
  {
    name: "Email",
    href: "mailto:debarghasaha16@gmail.com",
    icon: FaEnvelope,
    isExternal: false,
  },
];

export function Footer() {
  return (
    <footer className="w-full py-6 pb-8 flex justify-center items-center px-4 mt-auto">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/85 backdrop-blur-md px-4 py-1.5 shadow-2xs text-xs sm:text-sm text-muted-foreground transition-all hover:border-border">
        <span className="font-medium">
          Crafted by{" "}
          <a
            href="https://github.com/DEBargha2004"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            Debargha Saha
          </a>
        </span>

        <span className="h-3.5 w-px bg-border/80" aria-hidden="true" />

        <div className="flex items-center gap-2 sm:gap-2.5">
          {SOCIAL_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                {...(link.isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                title={link.name}
                aria-label={link.name}
              >
                <Icon className="size-3.5 sm:size-4" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
