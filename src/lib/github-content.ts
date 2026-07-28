const GITHUB_API = "https://api.github.com";

export function githubContentConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && getRepo());
}

export function shouldUseGitHubContent() {
  if (githubContentConfigured()) return true;
  // On Vercel the filesystem is read-only — require GitHub config.
  if (process.env.VERCEL === "1") {
    throw new Error(
      "This site runs on a read-only filesystem. Add GITHUB_TOKEN and GITHUB_REPO in Vercel env vars so admin can create, edit, and delete stories via GitHub.",
    );
  }
  return false;
}

function getRepo() {
  return process.env.GITHUB_REPO || "stephenrudge/stephenrudge.co";
}

function getBranch() {
  return process.env.GITHUB_BRANCH || "main";
}

function getToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured.");
  }
  return token;
}

function authHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${getToken()}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "stephenrudge.co-admin",
  };
}

function contentPath(slug: string) {
  return `content/posts/${slug}.mdx`;
}

function encodeContent(content: string) {
  return Buffer.from(content, "utf8").toString("base64");
}

async function getFileSha(path: string): Promise<string | null> {
  const url = `${GITHUB_API}/repos/${getRepo()}/contents/${path}?ref=${encodeURIComponent(getBranch())}`;
  const response = await fetch(url, { headers: authHeaders() });

  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub lookup failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { sha?: string };
  return data.sha ?? null;
}

export async function githubUpsertPostFile(slug: string, content: string) {
  const path = contentPath(slug);
  const sha = await getFileSha(path);
  const url = `${GITHUB_API}/repos/${getRepo()}/contents/${path}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: sha ? `Update story: ${slug}` : `Add story: ${slug}`,
      content: encodeContent(content),
      branch: getBranch(),
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub save failed (${response.status}): ${body}`);
  }
}

export async function githubDeletePostFile(slug: string) {
  const path = contentPath(slug);
  const sha = await getFileSha(path);
  if (!sha) {
    throw new Error("Post not found.");
  }

  const url = `${GITHUB_API}/repos/${getRepo()}/contents/${path}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Delete story: ${slug}`,
      sha,
      branch: getBranch(),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub delete failed (${response.status}): ${body}`);
  }
}
