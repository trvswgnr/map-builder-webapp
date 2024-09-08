// MapBuilder.tsx
import { Toaster } from "@/components/ui/toaster";
import Editor from "@/components/Editor";
import Toolbar from "@/components/Toolbar";
import Insights from "@/components/Insights";

export default function MapBuilder() {
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center my-5 md:my-10">
        <h1 className="text-2xl md:text-3xl font-bold">Map Builder</h1>
        <div className="flex justify-between items-center gap-4 md:gap-6">
          <GithubLink />
          <XLink />
          <EnvInfo />
        </div>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        <div className="panel col-span-2">
          <Editor />
        </div>
        <div className="panel flex flex-col gap-4">
          <Toolbar />
          <Insights />
        </div>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

function GithubLink(): React.ReactNode {
  return (
    <a
      href="https://github.com/trvswgnr/map-builder-webapp"
      className="block w-6 h-6 relative hover:opacity-80"
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <title>GitHub</title>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    </a>
  );
}

function XLink(): React.ReactNode {
  return (
    <a
      href="https://x.com/techsavvytravvy"
      className="block w-5 h-5 relative hover:opacity-80"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <title>X</title>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    </a>
  );
}

function Footer(): React.ReactNode {
  return (
    <div className="pt-10 md:pt-14 border-t text-sm text-muted-foreground mt-10 mb-12 md:mt-14 md:mb-16 flex flex-col gap-4 md:gap-3">
      <p>
        Made with 😡 by{" "}
        <a
          href="https://x.com/techsavvytravvy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:text-foreground"
        >
          @techsavvytravvy
        </a>
      </p>
      <p>
        <a
          href="https://github.com/trvswgnr/map-builder-webapp"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:text-foreground"
        >
          View on GitHub
        </a>
      </p>
    </div>
  );
}

function EnvInfo(): React.ReactNode {
  const bgColor =
    __GLOBALS__.env === "dev"
      ? "bg-orange-200 dark:bg-orange-800"
      : "bg-green-300 dark:bg-green-800";
  return (
    <>
      <span className="flex md:hidden items-center">
        <span
          className={`${bgColor} block py-1 px-1.5 border text-xs text-foreground`}
        >
          {__GLOBALS__.env}
        </span>
        <span className="block text-xs py-1 px-1.5 border border-l-0  text-foreground bg-gray-200 dark:bg-gray-600">
          v{__GLOBALS__.appVersion}
        </span>
      </span>
    </>
  );
}
