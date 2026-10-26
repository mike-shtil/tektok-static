type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const spotify =
  /^https?:\/\/open\.spotify\.com\/(?:embed\/)?(show|episode|track|playlist|album)\/([A-Za-z0-9]+)(?:[?#].*)?$/;

const heights: Record<string, number> = {
  show: 152,
  episode: 232,
  track: 152,
  album: 352,
  playlist: 352,
};

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (node.tagName === "a" && typeof node.properties?.href === "string") return node.properties.href;
  return (node.children ?? []).map(textOf).join("");
}

function iframe(kind: string, id: string): HastNode {
  return {
    type: "element",
    tagName: "iframe",
    properties: {
      src: `https://open.spotify.com/embed/${kind}/${id}?utm_source=oembed`,
      title: "Spotify",
      width: "100%",
      height: heights[kind] ?? 152,
      allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
      loading: "lazy",
      frameBorder: 0,
    },
    children: [],
  };
}

function spotifyNode(node: HastNode): HastNode | undefined {
  const raw = node.type === "text" ? node.value ?? "" : node.tagName === "a" ? textOf(node) : "";
  const match = raw.trim().match(spotify);
  if (!match || raw.trim() !== match[0]) return undefined;
  return iframe(match[1], match[2]);
}

/** WordPress oEmbeds a bare Spotify URL. The import left those lines as text. */
export function spotifyEmbed() {
  return (tree: HastNode) => {
    const walk = (node: HastNode, parent?: HastNode) => {
      const children = node.children;
      if (!children) return;
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        const embed = spotifyNode(child);
        if (embed) {
          if (node.tagName === "p" && parent?.children) {
            children.splice(index, 1);
            const at = parent.children.indexOf(node);
            parent.children.splice(at + 1, 0, embed);
            index -= 1;
          } else {
            children[index] = embed;
          }
          continue;
        }
        walk(child, node);
      }
    };
    walk(tree);
  };
}
